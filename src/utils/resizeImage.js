// Client-side image downscale. Parents commonly upload 4000x3000 phone
// photos; for a 40px avatar we only need ~512px. Canvas-based resize
// keeps things aspect-correct, re-encodes as JPEG (q=0.85) so we also
// strip metadata and usually shrink multi-MB files to ~50KB.
//
// Falls back to the original File if anything fails (OffscreenCanvas
// missing, weird HEIC, etc.) - the caller shouldn't break.

const MAX_SIDE = 512
const QUALITY = 0.85

export async function resizeImage(file) {
  if (!file) return file
  if (!file.type?.startsWith('image/')) return file
  try {
    const bitmap = await createBitmap(file)
    const { width, height } = bitmap
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
    const w = Math.round(width * scale)
    const h = Math.round(height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, w, h)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
    if (!blob) return file
    return new File([blob], renameExt(file.name, 'jpg'), { type: 'image/jpeg' })
  } catch {
    return file
  }
}

async function createBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function renameExt(name, ext) {
  const base = name.replace(/\.[^.]+$/, '')
  return `${base}.${ext}`
}
