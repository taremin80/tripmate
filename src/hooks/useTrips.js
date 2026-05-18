import { useState, useEffect } from 'react'
import {
  collection, doc, setDoc, deleteDoc, getDoc,
  onSnapshot, query, orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import { trips as sampleTrips } from '../data/sampleData'

export function useTrips(user) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setTrips([]); setLoading(false); return }

    const initAndListen = async () => {
      // 처음 가입한 사용자인지 확인 (init 플래그)
      const initRef = doc(db, 'trips', user.uid)
      const initSnap = await getDoc(initRef)

      if (!initSnap.exists()) {
        // 최초 1회만 샘플 데이터 저장
        await setDoc(initRef, { initialized: true, createdAt: Date.now() })
        for (const trip of sampleTrips) {
          await setDoc(
            doc(db, 'trips', user.uid, 'list', String(trip.id)),
            { ...trip, createdAt: Date.now() }
          )
        }
      }

      // 실시간 리스닝
      const q = query(
        collection(db, 'trips', user.uid, 'list'),
        orderBy('createdAt', 'desc')
      )
      const unsub = onSnapshot(q, (snap) => {
        setTrips(snap.docs.map(d => d.data()))
        setLoading(false)
      })
      return unsub
    }

    let unsub
    initAndListen().then(u => { unsub = u })
    return () => { if (unsub) unsub() }
  }, [user])

  async function saveTrip(trip) {
    if (!user) return
    await setDoc(
      doc(db, 'trips', user.uid, 'list', String(trip.id)),
      { ...trip, createdAt: trip.createdAt || Date.now() }
    )
  }

  async function removeTrip(tripId) {
    if (!user) return
    await deleteDoc(doc(db, 'trips', user.uid, 'list', String(tripId)))
  }

  return { trips, saveTrip, removeTrip, loading }
}
