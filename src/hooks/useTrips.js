import { useState, useEffect } from 'react'
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import { trips as sampleTrips } from '../data/sampleData'

export function useTrips(user) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setTrips([]); setLoading(false); return }

    const q = query(
      collection(db, 'trips', user.uid, 'list'),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        // 처음 로그인 시 샘플 데이터 저장
        for (const trip of sampleTrips) {
          await setDoc(
            doc(db, 'trips', user.uid, 'list', String(trip.id)),
            { ...trip, createdAt: Date.now() }
          )
        }
      } else {
        setTrips(snap.docs.map(d => d.data()))
      }
      setLoading(false)
    })

    return unsub
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

  return { trips, setTrips, saveTrip, removeTrip, loading }
}
