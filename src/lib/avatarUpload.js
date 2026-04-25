// Avatar photo helper.
// Takes a File from a <input type="file"> picker, resizes it to a 256x256
// square (cover-fit, centered) so we ship a small JPEG instead of a 12 MB
// phone photo, then uploads it to Firebase Storage at:
//   avatars/{boardId}/{kidId}.jpg
// Returns the downloadable URL ready to drop into Firestore as kid.avatarUrl.

import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

const MAX_DIM = 256
const QUALITY = 0.85
const MAX_INPUT_BYTES = 12 * 1024 * 1024 // 12 MB before resize — modern phones over-deliver

function readAsImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}

function resizeToSquareJpeg(img) {
  const canvas = document.createElement('canvas')
  canvas.width = MAX_DIM
  canvas.height = MAX_DIM
  const ctx = canvas.getContext('2d')
  // Cover-fit: scale so the smaller dimension fills, then center-crop.
  const ratio = img.width / img.height
  let sx = 0, sy = 0, sw = img.width, sh = img.height
  if (ratio > 1) {
    sw = img.height
    sx = (img.width - sw) / 2
  } else if (ratio < 1) {
    sh = img.width
    sy = (img.height - sh) / 2
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, MAX_DIM, MAX_DIM)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not encode image')),
      'image/jpeg',
      QUALITY,
    )
  })
}

export async function uploadKidAvatar({ boardId, kidId, file }) {
  if (!file) throw new Error('No file selected')
  if (!file.type.startsWith('image/')) throw new Error('That file isn\'t an image')
  if (file.size > MAX_INPUT_BYTES) throw new Error('Photo is too large (max 12 MB)')
  const img = await readAsImage(file)
  const blob = await resizeToSquareJpeg(img)
  const path = `avatars/${boardId}/${kidId}.jpg`
  const objectRef = storageRef(storage, path)
  // Cache-bust by adding a timestamp metadata so the browser refetches when
  // the same kid uploads a new photo (the URL stays the same path-wise).
  await uploadBytes(objectRef, blob, {
    contentType: 'image/jpeg',
    customMetadata: { uploadedAt: String(Date.now()) },
  })
  const url = await getDownloadURL(objectRef)
  return url
}

export async function deleteKidAvatar({ boardId, kidId }) {
  try {
    const objectRef = storageRef(storage, `avatars/${boardId}/${kidId}.jpg`)
    await deleteObject(objectRef)
  } catch (err) {
    // 404 is fine — nothing to delete.
    if (err?.code !== 'storage/object-not-found') throw err
  }
}
