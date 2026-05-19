import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrips } from './hooks/useTrips'
import { useAppSettings } from './hooks/useAppSettings'
import LoginScreen from './pages/LoginScreen'
import HomeScreen from './pages/HomeScreen'
import TripDetail from './pages/TripDetail'
import SettingsScreen from './pages/SettingsScreen'

const THEMES = {
  purple: { '--purple':'#5B4FCF', '--purple-light':'#EEF0FF', '--purple-dark':'#3D35A0' },
  teal:   { '--purple':'#0F9B8E', '--purple-light':'#E0F5F3', '--purple-dark':'#0A6E65' },
  coral:  { '--purple':'#E07B39', '--purple-light':'#FEF3E8', '--purple-dark':'#B5602C' },
  navy:   { '--purple':'#1E3A5F', '--purple-light':'#E8EEF5', '--purple-dark':'#132740' },
  rose:   { '--purple':'#C2185B', '--purple-light':'#FCE4EC', '--purple-dark':'#8E0038' },
}

export default function App() {
  const { user, logout, loading: authLoading } = useAuth()
  const { trips, saveTrip, removeTrip, loading: tripsLoading } = useTrips(user)
  const { settings: appSettings, saveSettings } = useAppSettings(user)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newTripForm, setNewTripForm] = useState({ title:'', location:'', startDate:'', endDate:'' })

  useEffect(() => {
    if (user && !appSettings.userName) saveSettings({ userName: user.displayName?.split(' ')[0] || '나' })
  }, [user])

  useEffect(() => {
    const theme = THEMES[appSettings.theme] || THEMES.purple
    Object.entries(theme).forEach(([k,v]) => document.documentElement.style.setProperty(k, v))
  }, [appSettings.theme])

  useEffect(() => {
    if (selectedTrip) {
      const updated = trips.find(t => t.id === selectedTrip.id)
      if (updated) setSelectedTrip(updated)
    }
  }, [trips])

  if (authLoading || tripsLoading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--purple)',gap:12}}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <div style={{color:'#fff',fontSize:15,opacity:.8}}>불러오는 중...</div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  async function updateTrip(updated) {
    await saveTrip(updated)
    setSelectedTrip(updated)
  }

  async function createTrip() {
    if (!newTripForm.title) return
    const colors = ['#5B4FCF','#0F9B8E','#E07B39','#E24B4A','#3A9E6F']
    const newTrip = {
      id: Date.now(), ...newTripForm,
      coverColor: colors[Math.floor(Math.random() * colors.length)],
      status: 'upcoming',
      members: [{ id:1, name:appSettings.userName||'나', initials:(appSettings.userName||'나').slice(0,1), color:'#EEEDFE', textColor:'#3D35A0' }],
      schedules:[], transports:[], stays:[], bookings:[], expenses:[], notices:[], photos:[],
      createdAt: Date.now(),
    }
    await saveTrip(newTrip)
    setNewTripForm({ title:'', location:'', startDate:'', endDate:'' })
    setShowNewTrip(false)
    setSelectedTrip(newTrip)
  }

  async function handleDeleteTrip(tripId) {
    await removeTrip(tripId)
    setSelectedTrip(null)
    setShowSettings(false)
  }

  async function handleUpdateTrips(updatedTrips) {
    const origIds = trips.map(t => String(t.id))
    const newIds = updatedTrips.map(t => String(t.id))
    for (const id of origIds.filter(id => !newIds.includes(id))) await removeTrip(id)
    for (const trip of updatedTrips) await saveTrip(trip)
  }

  if (showSettings) {
    return (
      <div className="app-shell">
        <SettingsScreen trips={trips} onBack={() => setShowSettings(false)}
          onUpdateTrips={handleUpdateTrips} onDeleteTrip={handleDeleteTrip}
          appSettings={appSettings} onUpdateSettings={saveSettings}
          user={user} onLogout={logout} />
      </div>
    )
  }

  if (!selectedTrip) {
    return (
      <div className="app-shell">
        <HomeScreen trips={trips}
          onSelect={t => setSelectedTrip(t)}
          onAdd={() => setShowNewTrip(true)}
          onSettings={() => setShowSettings(true)}
          bgImage={appSettings.heroBg || ''}
          onSaveBg={url => saveSettings({ heroBg: url })} />
        {showNewTrip && (
          <div className="modal-overlay" onClick={() => setShowNewTrip(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-title">새 여행 만들기 ✈️</div>
              <div className="form-group"><label className="form-label">여행 이름 *</label>
                <input className="form-input" placeholder="예: 구마모토 여행" value={newTripForm.title} onChange={e => setNewTripForm({...newTripForm,title:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">목적지</label>
                <input className="form-input" placeholder="예: 일본" value={newTripForm.location} onChange={e => setNewTripForm({...newTripForm,location:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">출발일</label>
                <input className="form-input" type="date" value={newTripForm.startDate} onChange={e => setNewTripForm({...newTripForm,startDate:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">귀국일</label>
                <input className="form-input" type="date" value={newTripForm.endDate} onChange={e => setNewTripForm({...newTripForm,endDate:e.target.value})} /></div>
              <button className="btn-primary" onClick={createTrip}>여행 만들기</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <TripDetail trip={selectedTrip} onUpdate={updateTrip} onBack={() => setSelectedTrip(null)} onSettings={() => setShowSettings(true)} />
    </div>
  )
}
