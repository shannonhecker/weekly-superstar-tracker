import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './config'
import { loadFromStorage, saveToStorage, initChecks } from '../utils/helpers'
import { DEFAULT_ACTIVITIES, DAYS } from '../utils/constants'

export function useFirestoreSync(themeKey, defaultName) {
  const storageKey = (k) => `tracker-${themeKey}-${k}`

  const [checks, setChecks] = useState(() => loadFromStorage(storageKey('checks'), initChecks(DEFAULT_ACTIVITIES, DAYS)))
  const [customLabel, setCustomLabel] = useState(() => loadFromStorage(storageKey('customLabel'), ''))
  const [childName, setChildName] = useState(() => loadFromStorage(storageKey('name'), defaultName))
  const [badges, setBadges] = useState(() => loadFromStorage(storageKey('badges'), []))
  const [weekHistory, setWeekHistory] = useState(() => loadFromStorage(storageKey('history'), []))
  const [reward, setReward] = useState(() => loadFromStorage(storageKey('reward'), null))

  const isLocalChange = useRef(false)
  const initialized = useRef(false)

  // Subscribe to Firestore real-time updates
  useEffect(() => {
    if (!db) return

    const docRef = doc(db, 'children', themeKey)
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists() && !isLocalChange.current) {
          const data = snapshot.data()
          if (data.checks) setChecks(data.checks)
          if (data.customLabel !== undefined) setCustomLabel(data.customLabel)
          if (data.name !== undefined) setChildName(data.name)
          if (data.badges) setBadges(data.badges)
          if (data.weekHistory) setWeekHistory(data.weekHistory)
          if (data.reward !== undefined) setReward(data.reward)
        }
        isLocalChange.current = false
        initialized.current = true
      },
      (error) => {
        console.warn('Firestore listener error:', error)
      }
    )
    return unsubscribe
  }, [themeKey])

  // Persist to both Firestore and localStorage on changes
  useEffect(() => {
    saveToStorage(storageKey('checks'), checks)
    saveToStorage(storageKey('customLabel'), customLabel)
    saveToStorage(storageKey('name'), childName)
    saveToStorage(storageKey('badges'), badges)
    saveToStorage(storageKey('history'), weekHistory)
    saveToStorage(storageKey('reward'), reward)

    if (!db || !initialized.current) return

    isLocalChange.current = true
    const data = { checks, customLabel, name: childName, badges, weekHistory, reward }
    setDoc(doc(db, 'children', themeKey), data, { merge: true }).catch((err) => {
      console.warn('Firestore write failed:', err)
    })
  }, [checks, customLabel, childName, badges, weekHistory, reward, themeKey])

  return {
    checks, setChecks,
    customLabel, setCustomLabel,
    childName, setChildName,
    badges, setBadges,
    weekHistory, setWeekHistory,
    reward, setReward,
  }
}
