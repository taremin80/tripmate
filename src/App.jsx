import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrips } from './hooks/useTrips'
import LoginScreen from './pages/LoginScreen'
import HomeScreen from './pages/HomeScreen'
import ScheduleTab from './pages/ScheduleTab'
import BookingTab from './pages/BookingTab'
import ExpenseTab from './pages/ExpenseTab'
import { PhotoTab, NoticeTab } from './pages/OtherTabs'
import SettingsScreen from './pages/SettingsScreen'
import { useAppSettings } from './hooks/useAppSettings'

const THEMES = {
  purple: { '--purple':'#5B4FCF', '--purple-light':'#EEF0FF', '--purple-dark':'#3D35A0' },
  teal:   { '--purple':'#0F9B8E', '--purple-light':'#E0F5F3', '--purple-dark':'#0A6E65' },
  coral:  { '--purple':'#E07B39', '--purple-light':'#FEF3E8', '--purple-dark':'#B5602C' },
  navy:   { '--purple':'#1E3A5F', '--purple-light':'#E8EEF5', '--purple-dark':'#132740' },
  rose:   { '--purple':'#C2185B', '--purple-light':'#FCE4EC', '--purple-dark':'#8E0038' },
}

const TABS = [
  { key:'schedule', label:'일정', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { key:'booking',  label:'예약', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg> },
  { key:'expense',  label:'경비', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { key:'photo',    label:'사진', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { key:'notice',   label:'공지', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
]

export default function App() {
  const { user, logout, loading: authLoading } = useAuth()
  const { trips, saveTrip, removeTrip, loading: tripsLoading } = useTrips(user)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [activeTab, setActiveTab] = useState('schedule')
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newTripForm, setNewTripForm] = useState({ title:'', location:'', startDate:'', endDate:'' })
  const { settings: appSettings, saveSettings } = useAppSettings(user)

  useEffect(() => {
    if (user) {
      const name = user.displayName?.split(' ')[0] || '나'
      saveSettings({ userName: name })
    }
  }, [user])

  useEffect(() => {
    const theme = THEMES[appSettings.theme] || THEMES.purple
    Object.entries(theme).forEach(([k,v]) => document.documentElement.style.setProperty(k, v))
  }, [appSettings.theme])

  // selectedTrip을 trips 변경 시 동기화
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
      id: Date.now(),
      ...newTripForm,
      coverColor: colors[Math.floor(Math.random() * colors.length)],
      status: 'upcoming',
      members: [{ id: 1, name: user.displayName?.split(' ')[0] || '나', initials: (user.displayName||'나').slice(0,1), color: '#EEEDFE', textColor: '#3D35A0' }],
      schedules: [], bookings: [], expenses: [], notices: [], photos: [],
      createdAt: Date.now(),
    }
    await saveTrip(newTrip)
    setNewTripForm({ title:'', location:'', startDate:'', endDate:'' })
    setShowNewTrip(false)
    setSelectedTrip(newTrip)
    setActiveTab('schedule')
  }

  async function handleDeleteTrip(tripId) {
    await removeTrip(tripId)
    setSelectedTrip(null)
    setShowSettings(false)
  }

  async function handleUpdateTrips(updatedTrips) {
    const origIds = trips.map(t => String(t.id))
    const newIds = updatedTrips.map(t => String(t.id))
    const deleted = origIds.filter(id => !newIds.includes(id))
    for (const id of deleted) await removeTrip(id)
    for (const trip of updatedTrips) await saveTrip(trip)
  }

  if (showSettings) {
    return (
      <div className="app-shell">
        <SettingsScreen
          trips={trips}
          onBack={() => setShowSettings(false)}
          onUpdateTrips={handleUpdateTrips}
          onDeleteTrip={handleDeleteTrip}
          appSettings={appSettings}
          onUpdateSettings={saveSettings}
          user={user}
          onLogout={logout}
        />
      </div>
    )
  }

  if (!selectedTrip) {
    return (
      <div className="app-shell">
        <HomeScreen
          trips={trips}
          onSelect={t => { setSelectedTrip(t); setActiveTab('schedule') }}
          onAdd={() => setShowNewTrip(true)}
          onSettings={() => setShowSettings(true)}
          bgImage={appSettings.heroBg || ''}
          onSaveBg={url => saveSettings({ heroBg: url })}
        />
        {showNewTrip && (
          <div className="modal-overlay" onClick={() => setShowNewTrip(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-title">새 여행 만들기 ✈️</div>
              <div className="form-group">
                <label className="form-label">여행 이름 *</label>
                <input className="form-input" placeholder="예: 오사카 · 교토" value={newTripForm.title} onChange={e => setNewTripForm({...newTripForm,title:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">목적지</label>
                <input className="form-input" placeholder="예: 일본" value={newTripForm.location} onChange={e => setNewTripForm({...newTripForm,location:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">출발일</label>
                <input className="form-input" type="date" value={newTripForm.startDate} onChange={e => setNewTripForm({...newTripForm,startDate:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">귀국일</label>
                <input className="form-input" type="date" value={newTripForm.endDate} onChange={e => setNewTripForm({...newTripForm,endDate:e.target.value})} />
              </div>
              <button className="btn-primary" onClick={createTrip}>여행 만들기</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderTab = () => {
    const props = { trip: selectedTrip, onUpdate: updateTrip }
    switch(activeTab) {
      case 'schedule': return <ScheduleTab {...props} />
      case 'booking':  return <BookingTab  {...props} />
      case 'expense':  return <ExpenseTab  {...props} />
      case 'photo':    return <PhotoTab    {...props} />
      case 'notice':   return <NoticeTab   {...props} />
    }
  }

  return (
    <div className="app-shell">
      <div style={{background:'var(--purple)',color:'#fff',padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
        <button onClick={() => setSelectedTrip(null)} style={{color:'#fff',display:'flex',alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700}}>{selectedTrip.title}</div>
          <div style={{fontSize:11,opacity:.8}}>{selectedTrip.location} · {selectedTrip.members.length}명</div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{color:'rgba(255,255,255,.8)',display:'flex'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {renderTab()}
      </div>
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.key} className={`tab-item ${activeTab===t.key?'active':''}`} onClick={() => setActiveTab(t.key)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
