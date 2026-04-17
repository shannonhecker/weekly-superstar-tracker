import { useState } from 'react'
import { createKid, updateKid, DEFAULT_ACTIVITIES } from '../firebase/kids'
import { uploadKidPhoto } from '../firebase/storage'
import { resizeImage } from '../utils/resizeImage'
import ThemePicker from './ThemePicker'
import ActivityEditor from './ActivityEditor'

const AddKidWizard = ({ boardId, existingCount, onClose, onCreated }) => {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('football')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoWarning, setPhotoWarning] = useState('')
  const [createdKidId, setCreatedKidId] = useState(null)

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setPhotoWarning('')
    try {
      const kidId = await createKid(boardId, {
        name: name.trim(),
        theme,
        activities,
        order: existingCount,
      })
      setCreatedKidId(kidId)
      if (photoFile) {
        try {
          const resized = await resizeImage(photoFile)
          const url = await uploadKidPhoto(boardId, kidId, resized)
          await updateKid(boardId, kidId, { photoUrl: url })
        } catch (e) {
          setPhotoWarning(
            `${name.trim()} was saved, but the photo didn't upload: ${e.message || 'please try again later from the kid menu'}.`
          )
          setSaving(false)
          return
        }
      }
      onCreated(kidId)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black font-display text-gray-800">
              {step === 1 && '👶 What\'s their name?'}
              {step === 2 && '🎨 Pick a theme'}
              {step === 3 && '📸 Add a photo'}
              {step === 4 && '⭐ Activities'}
            </h2>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
          </div>

          <div className="flex gap-1 mb-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex-1 h-1.5 rounded-full"
                style={{ background: n <= step ? '#7E57C2' : '#E8E8E8' }}
              />
            ))}
          </div>

          {step === 1 && (
            <div>
              <label className="block text-xs font-extrabold text-gray-500 mb-2">Kid's name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold outline-none focus:border-purple-400"
              />
            </div>
          )}

          {step === 2 && <ThemePicker value={theme} onChange={setTheme} />}

          {step === 3 && (
            <div>
              <label className="block text-xs font-extrabold text-gray-500 mb-2">Photo (optional)</label>
              <div className="flex flex-col items-center gap-3">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-28 h-28 rounded-full object-cover border-4 border-purple-200" />
                ) : (
                  <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl bg-gray-100 border-4 border-dashed border-gray-300">
                    📷
                  </div>
                )}
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border-2 border-purple-300 text-purple-600 font-bold text-sm">
                  Choose photo
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
                <p className="text-xs text-gray-400 font-semibold">or skip — they'll get a cute themed avatar</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <ActivityEditor activities={activities} onChange={setActivities} />
          )}

          {error && <div className="text-red-500 text-xs font-bold mt-3" role="alert">{error}</div>}

          {photoWarning && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-800 text-xs font-semibold" role="alert">
              ⚠️ {photoWarning}
            </div>
          )}

          <div className="flex gap-2 mt-5">
            {photoWarning ? (
              <button
                onClick={() => createdKidId && onCreated(createdKidId)}
                className="flex-1 py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500"
              >
                Continue without photo
              </button>
            ) : (
              <>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white font-extrabold text-sm text-gray-500"
                  >
                    Back
                  </button>
                )}
                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 && !name.trim()}
                    className="flex-1 py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500 disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500 disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create kid 🎉'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddKidWizard
