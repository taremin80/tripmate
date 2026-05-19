import React, { useState } from 'react'
import ScheduleTab from './ScheduleTab'
import TransportTab from './TransportTab'
import StayTab from './StayTab'
import BookingTab from './BookingTab'
import ExpenseTab from './ExpenseTab'
import { PhotoTab, NoticeTab } from './OtherTabs'

const TABS = [
  { key:'schedule',  label:'일정',   icon:'📅', hasDate:true  },
  { key:'transport', label:'교통',   icon:'✈️', hasDate:true  },
  { key:'stay',      label:'숙소',   icon:'🏨', hasDate:false },
  { key:'booking',   label:'예약',   icon:'🎫', hasDate:false },
  { key:'expense',   label:'경비',   icon:'💰', hasDate:false },
  { key:'photo',     label:'사진',   icon:'📸', hasDate:false },
  { key:'notice',    label:'공지',   icon:'📢', hasDate:false },
]

function getDates(startDate, endDate) {
  if (!startDate || !endDate) return []
  const dates = [], cur = new Date(startDate), end = new Date(endDate)
  const DAY = ['일','월','화','수','목','금','토']
  while (cur <= end) {
    dates.push({ key: cur.toISOString().split('T')[0], label:`${cur.getMonth()+1}/${cur.getDate()}(${DAY[cur.getDay()]})` })
    cur.setDate(cur.getDate()+1)
  }
  return dates
}

export default function TripDetail({ trip, onUpdate, onBack, onSettings }) {
  const [activeTab, setActiveTab] = useState('schedule')
  const dates = getDates(trip.startDate, trip.endDate)
  const [activeDate, setActiveDate] = useState(dates[0]?.key || '')
  const tab = TABS.find(t => t.key === activeTab)

  const props = { trip, onUpdate, activeDate, dates }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* 헤더 */}
      <div style={{background:'var(--purple)',color:'#fff',padding:'10px 16px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <button onClick={onBack} style={{color:'#fff',display:'flex',alignItems:'center',background:'none',border:'none'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700}}>{trip.title}</div>
          <div style={{fontSize:11,opacity:.8}}>{trip.location} · {trip.members.length}명</div>
        </div>
        <button onClick={onSettings} style={{color:'rgba(255,255,255,.8)',background:'none',border:'none',display:'flex'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>

      {/* 상단 가로 스크롤 탭 */}
      <div style={{display:'flex',overflowX:'auto',background:'var(--white)',borderBottom:'1px solid var(--gray-200)',flexShrink:0,scrollbarWidth:'none'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{flex:'0 0 auto',padding:'10px 14px',fontSize:12,fontWeight:activeTab===t.key?600:400,
              color:activeTab===t.key?'var(--purple)':'var(--gray-400)',
              borderBottom:activeTab===t.key?'2px solid var(--purple)':'2px solid transparent',
              background:'none',border:'none',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
            <span style={{fontSize:13}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* 날짜 탭 (일정·교통 탭에서만 표시) */}
      {tab?.hasDate && dates.length > 0 && (
        <div style={{display:'flex',overflowX:'auto',background:'var(--gray-50)',borderBottom:'1px solid var(--gray-200)',flexShrink:0,scrollbarWidth:'none'}}>
          {dates.map(d => (
            <button key={d.key} onClick={() => setActiveDate(d.key)}
              style={{flex:'0 0 auto',padding:'7px 12px',fontSize:11,fontWeight:500,
                color:activeDate===d.key?'var(--purple)':'var(--gray-400)',
                borderBottom:activeDate===d.key?'2px solid var(--purple)':'2px solid transparent',
                background:'none',border:'none',whiteSpace:'nowrap',cursor:'pointer'}}>
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* 콘텐츠 */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {activeTab==='schedule'  && <ScheduleTab  {...props} />}
        {activeTab==='transport' && <TransportTab {...props} />}
        {activeTab==='stay'      && <StayTab      {...props} />}
        {activeTab==='booking'   && <BookingTab   {...props} />}
        {activeTab==='expense'   && <ExpenseTab   {...props} />}
        {activeTab==='photo'     && <PhotoTab     trip={trip} onUpdate={onUpdate} />}
        {activeTab==='notice'    && <NoticeTab    trip={trip} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}
