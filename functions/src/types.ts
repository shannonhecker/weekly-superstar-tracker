// Types shared between the callable handler and the CV pipeline.
// The shape mirrors the iOS app's lib/sheetScan.ts so the client can
// pass the response straight to the existing confirm screen without
// reshaping. Keep these in sync if either side changes.

export interface SheetMetadata {
  boardId: string
  kidId: string
  weekKey: string
}

export interface SheetDetection {
  detections: Record<string, Record<string, boolean>>
  confidence: Record<string, Record<string, number>>
}

export interface ScanRequest {
  photoBase64: string
  meta: SheetMetadata
}

export interface Point2D {
  x: number
  y: number
}

export interface SheetCorners {
  topLeft: Point2D
  topRight: Point2D
  bottomLeft: Point2D
  bottomRight: Point2D
}

export interface DecodedQR {
  data: string
  center: Point2D
}
