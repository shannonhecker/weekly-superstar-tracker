// Unit tests for the pure-logic helpers in sheet-scan.ts.
// Sharp / jsqr image-pipeline behaviour is excluded — those are
// integration-shaped and need real photo fixtures, which belong in a
// follow-up PR alongside the iOS wiring.

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  bilinearMap,
  buildSheetUrl,
  cellPhotoRect,
  parseFiducialCorner,
  parseSheetUrl,
  pixelVariance,
  resolveCornersFromQRs,
  weekKeyToDayKeys,
} from './sheet-scan.js'
import type { SheetCorners } from './types.js'

describe('parseSheetUrl', () => {
  test('parses a well-formed sheet url', () => {
    const out = parseSheetUrl('weeklysuperstar://sheet?board=B1&kid=K1&week=2026-04-20')
    assert.deepEqual(out, { boardId: 'B1', kidId: 'K1', weekKey: '2026-04-20' })
  })

  test('returns null when a field is missing', () => {
    assert.equal(parseSheetUrl('weeklysuperstar://sheet?board=B1&kid=K1'), null)
  })

  test('returns null on the wrong protocol', () => {
    assert.equal(parseSheetUrl('https://sheet?board=B1&kid=K1&week=2026-04-20'), null)
  })

  test('returns null on malformed input', () => {
    assert.equal(parseSheetUrl('not a url'), null)
    assert.equal(parseSheetUrl(''), null)
  })
})

describe('buildSheetUrl ↔ parseSheetUrl', () => {
  test('round-trips a metadata object', () => {
    const meta = { boardId: 'B-42', kidId: 'K-7', weekKey: '2026-04-20' }
    const url = buildSheetUrl(meta)
    assert.deepEqual(parseSheetUrl(url), meta)
  })
})

describe('parseFiducialCorner', () => {
  test('accepts each valid corner code', () => {
    for (const c of ['tl', 'tr', 'bl', 'br'] as const) {
      assert.equal(parseFiducialCorner(`weeklysuperstar://fiducial?corner=${c}`), c)
    }
  })

  test('rejects unknown corner codes', () => {
    assert.equal(parseFiducialCorner('weeklysuperstar://fiducial?corner=xx'), null)
  })

  test('rejects wrong host', () => {
    assert.equal(parseFiducialCorner('weeklysuperstar://sheet?corner=tl'), null)
  })
})

describe('weekKeyToDayKeys', () => {
  test('returns 7 sequential ISO date keys', () => {
    const days = weekKeyToDayKeys('2026-04-20')
    assert.deepEqual(days, [
      '2026-04-20',
      '2026-04-21',
      '2026-04-22',
      '2026-04-23',
      '2026-04-24',
      '2026-04-25',
      '2026-04-26',
    ])
  })

  test('crosses month boundaries cleanly', () => {
    const days = weekKeyToDayKeys('2026-04-27')
    assert.equal(days?.[0], '2026-04-27')
    assert.equal(days?.[6], '2026-05-03')
  })

  test('returns null on malformed input', () => {
    assert.equal(weekKeyToDayKeys('2026/04/20'), null)
    assert.equal(weekKeyToDayKeys('not a date'), null)
    assert.equal(weekKeyToDayKeys(''), null)
  })
})

describe('bilinearMap', () => {
  const corners: SheetCorners = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 100, y: 0 },
    bottomLeft: { x: 0, y: 100 },
    bottomRight: { x: 100, y: 100 },
  }

  test('returns the named corner at canonical extremes', () => {
    assert.deepEqual(bilinearMap(corners, 0, 0), { x: 0, y: 0 })
    assert.deepEqual(bilinearMap(corners, 1, 0), { x: 100, y: 0 })
    assert.deepEqual(bilinearMap(corners, 0, 1), { x: 0, y: 100 })
    assert.deepEqual(bilinearMap(corners, 1, 1), { x: 100, y: 100 })
  })

  test('returns the centroid at u=0.5, v=0.5', () => {
    assert.deepEqual(bilinearMap(corners, 0.5, 0.5), { x: 50, y: 50 })
  })

  test('handles a skewed sheet', () => {
    const skewed: SheetCorners = {
      topLeft: { x: 10, y: 20 },
      topRight: { x: 200, y: 30 },
      bottomLeft: { x: 5, y: 180 },
      bottomRight: { x: 210, y: 200 },
    }
    const centre = bilinearMap(skewed, 0.5, 0.5)
    assert.equal(centre.x, (10 + 200 + 5 + 210) / 4)
    assert.equal(centre.y, (20 + 30 + 180 + 200) / 4)
  })
})

describe('cellPhotoRect', () => {
  const corners: SheetCorners = {
    topLeft: { x: 10, y: 10 },
    topRight: { x: 110, y: 10 },
    bottomLeft: { x: 10, y: 110 },
    bottomRight: { x: 110, y: 110 },
  }

  test('produces an axis-aligned rect inside a top-left cell', () => {
    const rect = cellPhotoRect(corners, 0, 0.1, 0, 0.1, 200, 200)
    assert.equal(rect.left, 10)
    assert.equal(rect.top, 10)
    // Float-arithmetic of (0.9 * 10 + 0.1 * 110) lands at 20.0000…04, which
    // ceils to 21, so allow either the exact width or a one-pixel overshoot.
    assert.ok(rect.width === 10 || rect.width === 11, `width was ${rect.width}`)
    assert.ok(rect.height === 10 || rect.height === 11, `height was ${rect.height}`)
  })

  test('clamps when the photo is smaller than the sheet bounds', () => {
    const rect = cellPhotoRect(corners, 0.9, 1, 0.9, 1, 80, 80)
    assert.ok(rect.left >= 0)
    assert.ok(rect.top >= 0)
    assert.ok(rect.left + rect.width <= 80)
    assert.ok(rect.top + rect.height <= 80)
  })

  test('never produces a zero-area rect', () => {
    const rect = cellPhotoRect(corners, 0.5, 0.5, 0.5, 0.5, 200, 200)
    assert.ok(rect.width >= 1)
    assert.ok(rect.height >= 1)
  })
})

describe('pixelVariance', () => {
  test('returns 0 for an empty buffer', () => {
    assert.equal(pixelVariance(new Uint8Array()), 0)
  })

  test('returns 0 for a uniform buffer', () => {
    const buf = new Uint8Array(100).fill(200)
    assert.equal(pixelVariance(buf), 0)
  })

  test('returns a positive value for a bimodal buffer', () => {
    const buf = new Uint8Array(100)
    for (let i = 0; i < 50; i++) buf[i] = 0
    for (let i = 50; i < 100; i++) buf[i] = 255
    const v = pixelVariance(buf)
    assert.ok(v > 1000, `expected variance > 1000, got ${v}`)
  })

  test('returns a small value for a low-contrast buffer', () => {
    const buf = new Uint8Array(100)
    for (let i = 0; i < 100; i++) buf[i] = 240 + (i % 4)
    const v = pixelVariance(buf)
    assert.ok(v < 10, `expected variance < 10, got ${v}`)
  })
})

describe('resolveCornersFromQRs', () => {
  const meta = { boardId: 'B1', kidId: 'K1', weekKey: '2026-04-20' }

  test('returns corners when all 4 fiducials + matching metadata are present', () => {
    const qrs = [
      { data: 'weeklysuperstar://fiducial?corner=tl', center: { x: 10, y: 10 } },
      { data: 'weeklysuperstar://fiducial?corner=tr', center: { x: 100, y: 10 } },
      { data: 'weeklysuperstar://fiducial?corner=bl', center: { x: 10, y: 100 } },
      { data: 'weeklysuperstar://fiducial?corner=br', center: { x: 100, y: 100 } },
      { data: buildSheetUrl(meta), center: { x: 90, y: 90 } },
    ]
    const corners = resolveCornersFromQRs(qrs, meta)
    assert.ok(corners)
    assert.deepEqual(corners?.topLeft, { x: 10, y: 10 })
    assert.deepEqual(corners?.bottomRight, { x: 100, y: 100 })
  })

  test('returns null when metadata QR is for a different sheet', () => {
    const qrs = [
      { data: 'weeklysuperstar://fiducial?corner=tl', center: { x: 10, y: 10 } },
      { data: 'weeklysuperstar://fiducial?corner=tr', center: { x: 100, y: 10 } },
      { data: 'weeklysuperstar://fiducial?corner=bl', center: { x: 10, y: 100 } },
      { data: 'weeklysuperstar://fiducial?corner=br', center: { x: 100, y: 100 } },
      { data: buildSheetUrl({ ...meta, kidId: 'OTHER' }), center: { x: 90, y: 90 } },
    ]
    assert.equal(resolveCornersFromQRs(qrs, meta), null)
  })

  test('returns null when a corner fiducial is missing', () => {
    const qrs = [
      { data: 'weeklysuperstar://fiducial?corner=tl', center: { x: 10, y: 10 } },
      { data: 'weeklysuperstar://fiducial?corner=tr', center: { x: 100, y: 10 } },
      { data: 'weeklysuperstar://fiducial?corner=bl', center: { x: 10, y: 100 } },
      { data: buildSheetUrl(meta), center: { x: 90, y: 90 } },
    ]
    assert.equal(resolveCornersFromQRs(qrs, meta), null)
  })
})
