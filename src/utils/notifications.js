// Notification layer placeholder. Currently a no-op so the rest of the
// app can call `notify()` in the right places (week reset, new badge,
// perfect week) without failing. To enable real push notifications:
//
// 1. Add Firebase Cloud Messaging via `import { getMessaging } from 'firebase/messaging'`.
// 2. Generate a VAPID key in Firebase Console -> Project Settings -> Cloud Messaging.
// 3. Populate VITE_FIREBASE_VAPID_KEY env var (see .github/workflows/deploy.yml).
// 4. Replace the stub below with a call to the FCM client SDK.
//
// The signature returns a promise so future async token-subscribe flows
// don't require changes at call sites.

export function notify(title, body) {
  // Browser-native notification if the user has granted permission. This
  // works today without FCM for "this tab/device" reminders; future work
  // swaps this for push so it fires across devices.
  if (typeof window === 'undefined') return Promise.resolve()
  if (!('Notification' in window)) return Promise.resolve()
  if (Notification.permission !== 'granted') return Promise.resolve()
  try {
    new Notification(title, { body, icon: '/favicon.svg' })
  } catch {
    // Some browsers require ServiceWorker for this constructor.
  }
  return Promise.resolve()
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  return Notification.requestPermission()
}
