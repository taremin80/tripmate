import { useState, useEffect } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useAppSettings(user) {
  const [settings, setSettings] = useState({
    userName: '나', theme: 'purple', currency: 'KRW', heroBg: ''
  })

  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'settings', user.uid)
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setSettings(s => ({ ...s, ...snap.data() }))
    })
    return unsub
  }, [user])

  async function saveSettings(patch) {
    if (!user) return
    const next = { ...settings, ...patch }
    setSettings(next)
    await setDoc(doc(db, 'settings', user.uid), next, { merge: true })
  }

  return { settings, saveSettings }
}
