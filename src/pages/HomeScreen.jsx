import React, { useState } from 'react'

function dday(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return 'D-Day'
  return '완료'
}

function formatDate(s, e) {
  const fmt = d => `${d.getMonth()+1}/${d.getDate()}`
  return `${fmt(new Date(s))} — ${fmt(new Date(e))}`
}

export default function HomeScreen({ trips, onSelect, onAdd }) {
  const upcoming = trips.filter(t => t.status === 'upcoming')
  const done = trips.filter(t => t.status === 'done')

  return (
    <>
      <div className="app-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1.12h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        <h1>TripMate</h1>
        <button onClick={onAdd} className="fab" style={{width:36,height:36,boxShadow:'none'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div className="screen">
        {upcoming.length > 0 && (
          <>
            <div className="section-label">다가오는 여행</div>
            {upcoming.map(trip => (
              <TripCard key={trip.id} trip={trip} onSelect={onSelect} />
            ))}
          </>
        )}
        {done.length > 0 && (
          <>
            <div className="section-label">지난 여행</div>
            {done.map(trip => (
              <TripCard key={trip.id} trip={trip} onSelect={onSelect} />
            ))}
          </>
        )}
        <button
          onClick={onAdd}
          style={{
            width:'100%', padding:'14px', borderRadius:12,
            border:'1.5px dashed var(--gray-200)', background:'transparent',
            color:'var(--gray-400)', fontSize:13, display:'flex',
            alignItems:'center', justifyContent:'center', gap:6, marginTop:4
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          새 여행 만들기
        </button>
      </div>
    </>
  )
}

function TripCard({ trip, onSelect }) {
  const dd = dday(trip.startDate)
  const totalExpense = trip.expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="card" onClick={() => onSelect(trip)} style={{cursor:'pointer',borderLeft:`3px solid ${trip.coverColor}`,borderRadius:'0 12px 12px 0',padding:'14px 14px 14px 12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{trip.title}</div>
          <div style={{fontSize:12,color:'var(--gray-400)'}}>{trip.location} · {formatDate(trip.startDate, trip.endDate)}</div>
        </div>
        <span className={`badge ${trip.status==='upcoming'?'badge-purple':'badge-teal'}`}>
          {trip.status==='upcoming' ? dd : '완료'}
        </span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
        <div style={{display:'flex',gap:4}}>
          {trip.members.map(m => (
            <div key={m.id} className="avatar" style={{background:m.color,color:m.textColor}}>{m.initials}</div>
          ))}
        </div>
        {trip.status==='done' && (
          <span style={{fontSize:11,color:'var(--gray-400)'}}>총 {totalExpense.toLocaleString()}원</span>
        )}
        {trip.status==='upcoming' && (
          <span style={{fontSize:11,color:'var(--gray-400)'}}>{trip.members.length}명</span>
        )}
      </div>
    </div>
  )
}
