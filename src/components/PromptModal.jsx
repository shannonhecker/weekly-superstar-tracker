import { useEffect, useState } from 'react'
import Modal from './Modal'

// Drop-in replacement for window.prompt, supporting one or two text fields.
// fields: [{ name, label, defaultValue, type, placeholder }, ...]
// onSubmit receives { [fieldName]: value } or a string when there's one field.
export default function PromptModal({
  open,
  onClose,
  onSubmit,
  title,
  emoji,
  fields = [],
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}) {
  const [values, setValues] = useState({})

  useEffect(() => {
    if (!open) return
    const initial = {}
    for (const f of fields) initial[f.name] = f.defaultValue ?? ''
    setValues(initial)
  }, [open, fields])

  const submit = (e) => {
    e?.preventDefault?.()
    if (fields.length === 1) onSubmit(values[fields[0].name])
    else onSubmit(values)
  }

  return (
    <Modal open={open} onClose={onClose} title={title} emoji={emoji}>
      <form onSubmit={submit}>
        {fields.map((f, idx) => (
          <div key={f.name} className={idx > 0 ? 'mt-3' : ''}>
            {f.label && (
              <label className="text-xs font-bold text-gray-500 mb-1 block">{f.label}</label>
            )}
            <input
              autoFocus={idx === 0}
              type={f.type || 'text'}
              value={values[f.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              placeholder={f.placeholder}
              inputMode={f.type === 'number' ? 'numeric' : undefined}
              className="w-full px-3 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-base font-bold"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full mt-4 py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-green-400 to-purple-500"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-xl text-gray-500 font-bold text-sm"
        >
          {cancelLabel}
        </button>
      </form>
    </Modal>
  )
}
