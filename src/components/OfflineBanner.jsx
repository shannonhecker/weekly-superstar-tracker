import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null
  return (
    <div className="bg-yellow-100 text-yellow-800 text-center text-xs font-bold py-1.5 px-3 fade-in">
      📡 You're offline — changes will sync when you reconnect
    </div>
  )
}
