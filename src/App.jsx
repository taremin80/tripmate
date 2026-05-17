import React, { useState } from 'react'
import { trips as initialTrips } from './data/sampleData'
import HomeScreen from './pages/HomeScreen'
import ScheduleTab from './pages/ScheduleTab'
import BookingTab from './pages/BookingTab'
import ExpenseTab from './pages/ExpenseTab'
import { PhotoTab, NoticeTab } from './pages/OtherTabs'

const TABS = [
  { key:'schedule', label:'일정', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { key:'booking',  label:'예약', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1.12h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> },
  { key:'expense',  label:'경비', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { key:'photo',    label:'사진', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { key:'notice',   label:'공지', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
]

export default function App() {
  const [trips, setTrips] = useState(initialTrips)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [activeTab, setActiveTab] = useState('schedule')
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [newTripForm, setNewTripForm] = useState({ title:'', location:'', startDate:'', endDate:'' })

  function updateTrip(updated) {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t))
    setSelectedTrip(updated)
  }

  function createTrip() {
    if (!newTripForm.title) return
    const colors = ['#5B4FCF','#0F9B8E','#E07B39','#E24B4A','#3A9E6F']
    const newTrip = {
      id: Date.now(),
      ...newTripForm,
      coverColor: colors[Math.floor(Math.random() * colors.length)],
      status: 'upcoming',
      members: [{ id: 1, name: '나', initials: '나', color: '#EEEDFE', textColor: '#3D35A0' }],
      schedules: [], bookings: [], expenses: [], notices: [], photos: [],
    }
    setTrips(prev => [newTrip, ...prev])
    setNewTripForm({ title:'', location:'', startDate:'', endDate:'' })
    setShowNewTrip(false)
    setSelectedTrip(newTrip)
    setActiveTab('schedule')
  }

  if (!selectedTrip) {
    return (
      <div className="app-shell">
        <HomeScreen trips={trips} onSelect={t => { setSelectedTrip(t); setActiveTab('schedule') }} onAdd={() => setShowNewTrip(true)} />

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
      {/* 상단 여행 제목 바 */}
      <div style={{background:'var(--purple)',color:'#fff',padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
        <button onClick={() => setSelectedTrip(null)} style={{color:'#fff',display:'flex',alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700}}>{selectedTrip.title}</div>
          <div style={{fontSize:11,opacity:.8}}>{selectedTrip.location} · {selectedTrip.members.length}명</div>
        </div>
        <div style={{display:'flex',gap:2}}>
          {selectedTrip.members.map(m => (
            <div key={m.id} className="avatar" style={{background:m.color+'33',color:'#fff',fontSize:11,width:26,height:26}}>{m.initials}</div>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {renderTab()}
      </div>

      {/* 탭 바 */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.key} className={`tab-item ${activeTab===t.key?'active':''}`} onClick={() => setActiveTab(t.key)}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
