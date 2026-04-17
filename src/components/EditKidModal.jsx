import { useEffect, useRef, useState } from 'react'
import { updateKid } from '../firebase/kids'
import { uploadKidPhoto } from '../firebase/storage'
import { resizeImage } from '../utils/resizeImage'
import { pickRandomPetIndex, pickRandomEggIndex } from '../utils/randomPets'
import ThemePicker from './ThemePicker'
import ActivityEditor from './ActivityEditor'

// Unified edit screen: rename, change theme, tweak activities, swap photo,
// and re-roll this week's mystery pet. History (badges, weekHistory) is
// preserved across all edits because we only mutate the identity fields.
const EditKidModal = ({ boardId, kid, onClose }) => {
  const [section, setSection] = useState('basics') // basics | theme | activities | pet
  const [name, setName] = useState(kid.name || '')
  const [theme, setTheme] = useState(kid.theme || 'football')
  const [activities, setActivities] = useState(kid.activities || [])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(kid.photoUrl || '')
  const [removePhoto, setRemovePhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const confirmRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setRemovePhoto(false)
  }

  const rerollPet = async () => {
    setSaving(true)
    try {
      await updateKid(boardId, kid.id, {
        petIdx: pickRandomPetIndex(),
        eggIdx: pickRandomEggIndex(),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not re-roll')
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const updates = {}
      if (name.trim() && name.trim() !== kid.name) updates.name = name.trim()
      if (theme !== kid.theme) updates.theme = theme
      if (activities !== kid.activities) updates.activities = activities

      if (removePhoto && kid.photoUrl) {
        updates.photoUrl = null
      } else if (photoFile) {
        try {
          const resized = await resizeImage(photoFile)
          const url = await uploadKidPhoto(boardId, kid.id, resized)
          updates.photoUrl = url
        } catch (e) {
          setError(`Photo upload failed: ${e.message || 'try again later'}`)
          setSaving(false)
          return
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateKid(boardId, kid.id, updates)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Save failed')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-kid-title"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="edit-kid-title" className="text-lg font-black font-display text-gray-800">
              ✏️ Edit {kid.name}
            </h2>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 text-2xl leading-none">×</button>
          </div>

          <div role="tablist" aria-label="Edit sections" className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {[
              { id: 'basics', label: '👤 Basics' },
              { id: 'theme', label: '🎨 Theme' },
              { id: 'activities', label: '⭐ Activities' },
              { id: 'pet', label: '🐣 Pet' },
            ].map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={section === t.id}
                onClick={() => setSection(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap"
                style={{
                  background: section === t.id ? '#7C6FF7' : '#F3F4F6',
                  color: section === t.id ? 'white' : '#6B7280',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {section === 'basics' && (
            <div>
              <label htmlFor="edit-name" className="block text-xs font-extrabold text-gray-500 mb-1">Name</label>
              <input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold outline-none focus:border-purple-400 mb-4"
              />

              <label className="block text-xs font-extrabold text-gray-500 mb-2">Photo</label>
              <div className="flex items-center gap-3">
                {photoPreview && !removePhoto ? (
                  <img src={photoPreview} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-purple-100" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-gray-100 border-4 border-dashed border-gray-300">
                    📷
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white border-2 border-purple-300 text-purple-600 font-bold text-xs text-center">
                    Choose new photo
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </label>
                  {(kid.photoUrl || photoFile) && !removePhoto && (
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(''); setRemovePhoto(true) }}
                      className="px-3 py-2 rounded-xl bg-white border-2 border-red-200 text-red-500 font-bold text-xs"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {section === 'theme' && (
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3">
                Changing the theme won't erase history or badges.
              </p>
              <ThemePicker value={theme} onChange={setTheme} />
            </div>
          )}

          {section === 'activities' && (
            <ActivityEditor activities={activities} onChange={setActivities} />
          )}

          {section === 'pet' && (
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3">
                Re-roll this week's mystery pet. The next weekly reset will randomise again automatically.
              </p>
              <button
                ref={confirmRef}
                onClick={rerollPet}
                disabled={saving}
                className="w-full py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500 disabled:opacity-50"
              >
                🎲 Re-roll mystery pet
              </button>
            </div>
          )}

          {error && <div className="text-red-500 text-xs font-bold mt-3" role="alert">{error}</div>}

          {section !== 'pet' && (
            <div className="flex gap-2 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white font-extrabold text-sm text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !name.trim()}
                className="flex-1 py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditKidModal
