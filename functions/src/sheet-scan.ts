// sheet-scan — F1 phase 2 CV pipeline.
//
// Pipeline:
//   1. Decode all QR codes in the photo (jsqr). Expect 4 — three corner
//      fiducials with payload "weeklysuperstar://fiducial?corner={tl|tr|bl|br}"
//      and one metadata QR with payload "weeklysuperstar://sheet?board=...".
//   2. Verify the metadata QR matches the SheetMetadata supplied by the
//      caller (defends against scanning the wrong sheet for a different kid).
//   3. From the 4 QR centres, build a bilinear map from canonical sheet
//      coordinates [0,1]² to photo pixel space. Bilinear is sufficient for
//      near-frontal phone photos; it degrades gracefully under mild
//      perspective. A full homography is overkill for the MVP.
//   4. For each grid cell (rows = activities, columns = 7 days), extract
//      the photo region the cell maps to, convert to greyscale, compute
//      pixel-value variance. Variance above VARIANCE_THRESHOLD ⇒ filled.

import sharp from 'sharp'
// jsqr ships ESM-style `export default` typings against a CJS UMD bundle, so
// under module: NodeNext the default import resolves to the namespace rather
// than the callable. Pluck `.default` at runtime to get the actual function
// in both interop modes.
import jsQRImport from 'jsqr'
import type {
  DecodedQR,
  Point2D,
  ScanRequest,
  SheetCorners,
  SheetDetection,
  SheetMetadata,
} from './types.js'

type JSQRPoint = { x: number; y: number }
type JSQRResult = {
  data: string
  location: {
    topLeftCorner: JSQRPoint
    topRightCorner: JSQRPoint
    bottomLeftCorner: JSQRPoint
    bottomRightCorner: JSQRPoint
  }
}
type JSQRFn = (data: Uint8ClampedArray, width: number, height: number) => JSQRResult | null
const jsQR: JSQRFn =
  (jsQRImport as unknown as { default?: JSQRFn }).default ??
  (jsQRImport as unknown as JSQRFn)

const VARIANCE_THRESHOLD = 500
const MIN_CELL_PIXELS = 16

const FIDUCIAL_PROTOCOL = 'weeklysuperstar:'
const FIDUCIAL_HOST = 'fiducial'
const SHEET_HOST = 'sheet'

// MUST match GRID_*_PCT in src/pages/PrintSheet.jsx — the print sheet
// is the authoritative source (empirical visual layout); CV pipeline crops
// each cell back out using these same percentages.
const GRID_TOP_PADDING = 0.14
const GRID_BOTTOM_PADDING = 0.04
const GRID_LEFT_PADDING = 0.18
const GRID_RIGHT_PADDING = 0.04

// ---------- URL helpers (kept symmetric with iOS lib/sheetScan.ts) ----------

export function parseSheetUrl(raw: string): SheetMetadata | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== FIDUCIAL_PROTOCOL) return null
    if (url.host !== SHEET_HOST && url.pathname !== '/sheet') return null
    const boardId = url.searchParams.get('board')
    const kidId = url.searchParams.get('kid')
    const weekKey = url.searchParams.get('week')
    if (!boardId || !kidId || !weekKey) return null
    return { boardId, kidId, weekKey }
  } catch {
    return null
  }
}

export function buildSheetUrl(meta: SheetMetadata): string {
  const params = new URLSearchParams({
    board: meta.boardId,
    kid: meta.kidId,
    week: meta.weekKey,
  })
  return `weeklysuperstar://sheet?${params.toString()}`
}

export function parseFiducialCorner(raw: string): 'tl' | 'tr' | 'bl' | 'br' | null {
  try {
    const url = new URL(raw)
    if (url.protocol !== FIDUCIAL_PROTOCOL) return null
    if (url.host !== FIDUCIAL_HOST && url.pathname !== '/fiducial') return null
    const corner = url.searchParams.get('corner')
    if (corner === 'tl' || corner === 'tr' || corner === 'bl' || corner === 'br') {
      return corner
    }
    return null
  } catch {
    return null
  }
}

// ---------- Date helpers ----------

/**
 * Convert a weekKey ("YYYY-MM-DD" of the Monday) into the 7 ISO date keys
 * Mon..Sun. Returns null if the key is malformed.
 */
export function weekKeyToDayKeys(weekKey: string): string[] | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) return null
  const monday = new Date(`${weekKey}T00:00:00Z`)
  if (Number.isNaN(monday.getTime())) return null
  const out: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

// ---------- Geometry ----------

/**
 * Bilinear map from canonical (u, v) ∈ [0,1]² to photo pixel space, given
 * the four sheet corner points in photo space. Used to locate every grid
 * cell in the captured image.
 */
export function bilinearMap(corners: SheetCorners, u: number, v: number): Point2D {
  const { topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br } = corners
  const x =
    (1 - u) * (1 - v) * tl.x +
    u * (1 - v) * tr.x +
    (1 - u) * v * bl.x +
    u * v * br.x
  const y =
    (1 - u) * (1 - v) * tl.y +
    u * (1 - v) * tr.y +
    (1 - u) * v * bl.y +
    u * v * br.y
  return { x, y }
}

interface CellRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * For a single grid cell defined by canonical bounds, return the
 * axis-aligned bounding rectangle in photo space. Clamps to the image
 * dimensions so Sharp.extract never throws on edge cells.
 */
export function cellPhotoRect(
  corners: SheetCorners,
  uStart: number,
  uEnd: number,
  vStart: number,
  vEnd: number,
  imageWidth: number,
  imageHeight: number,
): CellRect {
  const points = [
    bilinearMap(corners, uStart, vStart),
    bilinearMap(corners, uEnd, vStart),
    bilinearMap(corners, uStart, vEnd),
    bilinearMap(corners, uEnd, vEnd),
  ]
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  // Clamp every edge to the image bounds — both lower and upper. Without
  // clamping `minX`, a cell whose bilinear projection falls entirely off the
  // image would return a rect whose `left` exceeds `imageWidth`, which Sharp
  // happily extracts off-image and the caller can't recover from.
  const minX = Math.max(0, Math.min(imageWidth - 1, Math.floor(Math.min(...xs))))
  const maxX = Math.max(0, Math.min(imageWidth, Math.ceil(Math.max(...xs))))
  const minY = Math.max(0, Math.min(imageHeight - 1, Math.floor(Math.min(...ys))))
  const maxY = Math.max(0, Math.min(imageHeight, Math.ceil(Math.max(...ys))))
  return {
    left: minX,
    top: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  }
}

// ---------- Variance ----------

/**
 * Population variance of an unsigned-byte greyscale buffer. The pixel
 * value range is 0–255, so a uniform near-white cell variance is small
 * (≪ 100) while a stamped/coloured cell typically scores in the 500+
 * range under typical phone-camera lighting.
 */
export function pixelVariance(buf: Uint8Array | Buffer): number {
  if (buf.length === 0) return 0
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i]
  const mean = sum / buf.length
  let sqdiff = 0
  for (let i = 0; i < buf.length; i++) {
    const d = buf[i] - mean
    sqdiff += d * d
  }
  return sqdiff / buf.length
}

// ---------- QR decoding ----------

/**
 * Decode every QR code visible in a photo. jsqr scans a single QR per
 * call, so we run a tiled sweep — the 4 sheet QRs sit in distinct
 * quadrants, so decoding each quadrant independently usually suffices.
 * Returns the decoded payload + the centre point of the QR in photo
 * pixel coordinates.
 */
export async function decodeSheetQRs(buffer: Buffer): Promise<DecodedQR[]> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const width = info.width
  const height = info.height
  const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength)

  const found: DecodedQR[] = []
  const seen = new Set<string>()

  const quadrants: Array<[number, number, number, number]> = [
    [0, 0, Math.floor(width / 2) + 32, Math.floor(height / 2) + 32],
    [Math.floor(width / 2) - 32, 0, width, Math.floor(height / 2) + 32],
    [0, Math.floor(height / 2) - 32, Math.floor(width / 2) + 32, height],
    [Math.floor(width / 2) - 32, Math.floor(height / 2) - 32, width, height],
    [0, 0, width, height],
  ]

  for (const [x0, y0, x1, y1] of quadrants) {
    const w = Math.max(0, x1 - x0)
    const h = Math.max(0, y1 - y0)
    if (w < 16 || h < 16) continue
    const cropped = new Uint8ClampedArray(w * h * 4)
    for (let y = 0; y < h; y++) {
      const srcRow = (y0 + y) * width * 4
      const dstRow = y * w * 4
      cropped.set(pixels.subarray(srcRow + x0 * 4, srcRow + (x0 + w) * 4), dstRow)
    }
    const result = jsQR(cropped, w, h)
    if (!result) continue
    if (seen.has(result.data)) continue
    seen.add(result.data)
    const cx = (result.location.topLeftCorner.x + result.location.bottomRightCorner.x) / 2 + x0
    const cy = (result.location.topLeftCorner.y + result.location.bottomRightCorner.y) / 2 + y0
    found.push({ data: result.data, center: { x: cx, y: cy } })
  }

  return found
}

/**
 * Pull the 4 named corners out of a decoded-QR list. Returns null if any
 * corner or the metadata QR is missing, or if the metadata payload does
 * not match the caller's SheetMetadata.
 */
export function resolveCornersFromQRs(
  qrs: DecodedQR[],
  expected: SheetMetadata,
): SheetCorners | null {
  let tl: Point2D | null = null
  let tr: Point2D | null = null
  let bl: Point2D | null = null
  let br: Point2D | null = null
  let metaMatched = false

  for (const qr of qrs) {
    const corner = parseFiducialCorner(qr.data)
    if (corner === 'tl') tl = qr.center
    else if (corner === 'tr') tr = qr.center
    else if (corner === 'bl') bl = qr.center
    else if (corner === 'br') br = qr.center
    else {
      const meta = parseSheetUrl(qr.data)
      if (
        meta &&
        meta.boardId === expected.boardId &&
        meta.kidId === expected.kidId &&
        meta.weekKey === expected.weekKey
      ) {
        metaMatched = true
      }
    }
  }

  if (!metaMatched) return null
  if (!tl || !tr || !bl || !br) return null
  return { topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br }
}

// ---------- Cell sampling ----------

interface DetectionContext {
  buffer: Buffer
  width: number
  height: number
  corners: SheetCorners
  activityIds: string[]
  dayKeys: string[]
}

/**
 * Sample every (activity, day) cell and decide filled/empty by greyscale
 * variance. Returns the SheetDetection map plus per-cell variance for
 * downstream confidence reporting.
 */
export async function detectFilledCells(ctx: DetectionContext): Promise<SheetDetection> {
  const { buffer, width, height, corners, activityIds, dayKeys } = ctx

  const detections: Record<string, Record<string, boolean>> = {}
  const confidence: Record<string, Record<string, number>> = {}

  const rowCount = activityIds.length
  if (rowCount === 0) return { detections, confidence }

  const usableU0 = GRID_LEFT_PADDING
  const usableU1 = 1 - GRID_RIGHT_PADDING
  const usableV0 = GRID_TOP_PADDING
  const usableV1 = 1 - GRID_BOTTOM_PADDING
  const cellU = (usableU1 - usableU0) / dayKeys.length
  const cellV = (usableV1 - usableV0) / rowCount

  for (let r = 0; r < rowCount; r++) {
    const activityId = activityIds[r]
    detections[activityId] = {}
    confidence[activityId] = {}
    for (let c = 0; c < dayKeys.length; c++) {
      const dayKey = dayKeys[c]
      const uStart = usableU0 + c * cellU
      const uEnd = uStart + cellU
      const vStart = usableV0 + r * cellV
      const vEnd = vStart + cellV
      const rect = cellPhotoRect(corners, uStart, uEnd, vStart, vEnd, width, height)
      if (rect.width * rect.height < MIN_CELL_PIXELS) {
        detections[activityId][dayKey] = false
        confidence[activityId][dayKey] = 0
        continue
      }
      const cellBuffer = await sharp(buffer)
        .extract({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
        .greyscale()
        .raw()
        .toBuffer()
      const variance = pixelVariance(cellBuffer)
      detections[activityId][dayKey] = variance > VARIANCE_THRESHOLD
      confidence[activityId][dayKey] = Math.min(1, variance / (VARIANCE_THRESHOLD * 4))
    }
  }

  return { detections, confidence }
}

// ---------- Top-level orchestrator ----------

/**
 * The pure-logic entry point. The callable handler in index.ts wraps
 * this with auth + Firestore lookups, but the pipeline itself only
 * needs the photo bytes, the metadata, and the kid's activity-id list.
 * Decoupling these makes the pipeline trivially unit-testable with
 * synthetic inputs.
 */
export async function processSheetPhoto(
  request: ScanRequest,
  activityIds: string[],
): Promise<SheetDetection> {
  const buffer = Buffer.from(request.photoBase64, 'base64')
  const meta = await sharp(buffer).metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  if (!width || !height) throw new Error('photo has zero dimensions')

  const qrs = await decodeSheetQRs(buffer)
  const corners = resolveCornersFromQRs(qrs, request.meta)
  if (!corners) throw new Error('failed to locate sheet — need 3 fiducials + matching metadata QR')

  const dayKeys = weekKeyToDayKeys(request.meta.weekKey)
  if (!dayKeys) throw new Error(`malformed weekKey: ${request.meta.weekKey}`)

  return detectFilledCells({
    buffer,
    width,
    height,
    corners,
    activityIds,
    dayKeys,
  })
}
