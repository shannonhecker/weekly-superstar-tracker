import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

export async function uploadKidPhoto(boardId, kidId, file) {
  if (!storage) throw new Error('Storage not configured')
  const path = `boards/${boardId}/kids/${kidId}/photo-${Date.now()}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}
