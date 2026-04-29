import Logo from './Logo'

export default function LogoLoader({ label = 'Loading...' }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-earthy-ivory px-6 font-jakarta"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <div className="logo-loader-stage">
          <span aria-hidden className="logo-loader-sparkle logo-loader-sparkle-one" />
          <span aria-hidden className="logo-loader-sparkle logo-loader-sparkle-two" />
          <span aria-hidden className="logo-loader-sparkle logo-loader-sparkle-three" />
          <Logo size={88} className="logo-loader-mark" />
          <span aria-hidden className="logo-loader-shadow" />
        </div>
        <p className="text-sm font-extrabold text-earthy-cocoa tracking-normal">
          {label}
        </p>
      </div>
    </div>
  )
}
