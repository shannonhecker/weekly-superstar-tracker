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
  emojiClassName,
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
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      emoji={emoji}
      emojiClassName={emojiClassName}
      panelClassName="!max-w-xl !overflow-hidden"
    >
      <form onSubmit={submit} className="flex flex-col">
        <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
        {fields.map((f, idx) => (
          <div key={f.name} className={idx > 0 ? 'mt-4' : ''}>
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
              className="w-full px-3 py-3 rounded-xl border-2 border-earthy-divider bg-earthy-card focus:border-earthy-terracotta focus:outline-none text-base font-bold text-earthy-cocoa"
            />
          </div>
        ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
            className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold transition-all hover:bg-earthy-cocoaDark active:scale-[0.99] sm:w-auto sm:min-w-36"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
