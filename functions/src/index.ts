// Callable entry point for the F1 sheet-scan pipeline.
//
// Client (iOS app) calls this with a base64-encoded photo of the
// printed reward sheet plus the SheetMetadata (boardId, kidId,
// weekKey). The handler verifies the caller is a member of the board,
// loads the kid's activity list to know the grid dimensions, runs
// the CV pipeline, and returns the detection map for the confirm
// screen.

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { processSheetPhoto } from './sheet-scan.js'
import type { ScanRequest, SheetDetection } from './types.js'

if (!getApps().length) initializeApp()

const MAX_PHOTO_BYTES = 8 * 1024 * 1024

interface KidDoc {
  activities?: Array<{ id?: string }>
}

interface BoardDoc {
  memberIds?: string[]
}

export const scanSheet = onCall<ScanRequest, Promise<SheetDetection>>(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
    cors: true,
  },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) throw new HttpsError('unauthenticated', 'sign-in required')

    const data = request.data
    if (!data || typeof data !== 'object') throw new HttpsError('invalid-argument', 'missing payload')
    if (typeof data.photoBase64 !== 'string' || data.photoBase64.length === 0) {
      throw new HttpsError('invalid-argument', 'photoBase64 missing')
    }
    if (data.photoBase64.length > MAX_PHOTO_BYTES * 1.4) {
      throw new HttpsError('invalid-argument', 'photo too large — downscale before upload')
    }
    if (!data.meta || typeof data.meta !== 'object') {
      throw new HttpsError('invalid-argument', 'meta missing')
    }
    const { boardId, kidId, weekKey } = data.meta
    if (typeof boardId !== 'string' || typeof kidId !== 'string' || typeof weekKey !== 'string') {
      throw new HttpsError('invalid-argument', 'meta fields must be strings')
    }

    const db = getFirestore()

    const boardSnap = await db.collection('boards').doc(boardId).get()
    if (!boardSnap.exists) throw new HttpsError('not-found', 'board not found')
    const board = boardSnap.data() as BoardDoc
    if (!board.memberIds?.includes(uid)) {
      throw new HttpsError('permission-denied', 'not a member of this board')
    }

    const kidSnap = await db.collection('boards').doc(boardId).collection('kids').doc(kidId).get()
    if (!kidSnap.exists) throw new HttpsError('not-found', 'kid not found')
    const kid = kidSnap.data() as KidDoc
    const activityIds: string[] = (kid.activities ?? [])
      .map((a) => a.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)

    if (activityIds.length === 0) {
      return { detections: {}, confidence: {} }
    }

    try {
      return await processSheetPhoto(data, activityIds)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'scan failed'
      throw new HttpsError('failed-precondition', message)
    }
  },
)
