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
              <label className="text-xs font-bold text-earthy-cocoaSoft mb-1 block uppercase tracking-wide">{f.label}</label>
            )}
            <input
              autoFocus={idx === 0}
              type={f.type || 'text'}
              value={values[f.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              placeholder={f.placeholder}
              inputMode={f.type === 'number' ? 'numeric' : undefined}
              className="w-full px-3 py-3 rounded-xl border-2 border-earthy-divider bg-earthy-ivory focus:border-earthy-terracotta focus:outline-none text-base font-bold text-earthy-cocoa"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full mt-4 py-3 rounded-pill text-earthy-ivory font-bold bg-earthy-cocoa hover:bg-[#4A2E25] active:scale-[0.99] transition-all"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-pill text-earthy-cocoaSoft font-bold text-sm hover:text-earthy-cocoa"
        >
          {cancelLabel}
        </button>
      </form>
    </Modal>
  )
}
