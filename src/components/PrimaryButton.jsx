// Polymorphic primary CTA — the cocoa-on-cream pill that is the
// conversion-critical button across SignIn, SignUp, ForgotPassword,
// and AuthAction. `as` lets us swap the underlying element to a
// react-router Link without duplicating the styling. `className`
// merges with the base classes so callers can add positional tweaks
// like `mt-2` / `mt-4` without re-stating the visual.
//
// The theme-picker "Continue" CTA in SignUp is intentionally NOT
// using this component — it has a different shape (px-8 inline,
// not w-full) and an explicit hover-bg override. If a third "tonal
// pill" variant emerges, lift this one to a `<PillButton variant>`
// pattern instead of re-inlining.
export default function PrimaryButton({ as: Tag = 'button', className = '', children, ...rest }) {
  return (
    <Tag
      {...(Tag === 'button' ? { type: rest.type || 'button' } : null)}
      {...rest}
      className={[
        'w-full inline-flex items-center justify-center py-4 rounded-pill',
        'bg-earthy-cocoa text-earthy-cream font-bold text-base shadow-earthy-soft',
        'hover:-translate-y-0.5 active:translate-y-0',
        'disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed',
        'transition-all',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
