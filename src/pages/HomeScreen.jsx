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

function formatDateFull(s) {
  const d = new Date(s)
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`
}

export default function HomeScreen({ trips, onSelect, onAdd, onSettings }) {
  const upcoming = trips.filter(t => t.status === 'upcoming')
  const done = trips.filter(t => t.status === 'done')
  const totalExpenseAll = trips.reduce((s, t) => s + t.expenses.reduce((a, e) => a + e.amount, 0), 0)
  const nextTrip = upcoming[0]

  return (
    <>
      {/* 헤더 */}
      <div style={{background:'var(--purple)',padding:'16px 16px 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{color:'#fff',fontWeight:700,fontSize:17,letterSpacing:-.3}}>TripMate</span>
          </div>
          <button onClick={onSettings} style={{color:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center',width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.15)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>

        {/* 다음 여행 배너 */}
        {nextTrip ? (
          <div onClick={() => onSelect(nextTrip)} style={{background:'rgba(255,255,255,.13)',borderRadius:'14px 14px 0 0',padding:'14px 14px 18px',cursor:'pointer'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)',marginBottom:4}}>다음 여행</div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff',marginBottom:2}}>{nextTrip.title}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.8)',marginBottom:10}}>{formatDateFull(nextTrip.startDate)} 출발</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',gap:4}}>
                {nextTrip.members.map(m => (
                  <div key={m.id} style={{width:26,height:26,borderRadius:'50%',background:'rgba(255,255,255,.25)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600}}>{m.initials}</div>
                ))}
              </div>
              <span style={{background:'rgba(255,255,255,.25)',color:'#fff',fontSize:13,fontWeight:700,padding:'4px 12px',borderRadius:20}}>
                {dday(nextTrip.startDate)}
              </span>
            </div>
          </div>
        ) : (
          <div style={{background:'rgba(255,255,255,.13)',borderRadius:'14px 14px 0 0',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,.7)',marginBottom:8}}>예정된 여행이 없어요</div>
            <button onClick={onAdd} style={{background:'rgba(255,255,255,.25)',color:'#fff',fontSize:12,padding:'7px 16px',borderRadius:20,fontWeight:500}}>새 여행 만들기</button>
          </div>
        )}
      </div>

      {/* 통계 요약 */}
      <div style={{background:'var(--white)',borderBottom:'1px solid var(--gray-100)',padding:'12px 16px',display:'flex',gap:8}}>
        {[
          { label:'총 여행', value: trips.length+'회' },
          { label:'함께한 여행', value: done.length+'회' },
          { label:'총 경비', value: (totalExpenseAll/10000).toFixed(0)+'만원' },
        ].map(s => (
          <div key={s.label} style={{flex:1,textAlign:'center',padding:'8px 4px',background:'var(--gray-50)',borderRadius:10}}>
            <div style={{fontSize:16,fontWeight:700,color:'var(--purple)'}}>{s.value}</div>
            <div style={{fontSize:10,color:'var(--gray-400)',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="screen">
        {upcoming.length > 0 && (
          <>
            <div className="section-label">다가오는 여행</div>
            {upcoming.map(trip => <TripCard key={trip.id} trip={trip} onSelect={onSelect} />)}
          </>
        )}
        {done.length > 0 && (
          <>
            <div className="section-label">지난 여행</div>
            {done.map(trip => <TripCard key={trip.id} trip={trip} onSelect={onSelect} />)}
          </>
        )}
        <button onClick={onAdd} style={{width:'100%',padding:'14px',borderRadius:12,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:4}}>
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
  const nights = Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000)

  return (
    <div className="card" onClick={() => onSelect(trip)} style={{cursor:'pointer',overflow:'hidden',padding:0}}>
      {/* 컬러 상단 바 */}
      <div style={{height:5,background:trip.coverColor}} />
      <div style={{padding:'12px 14px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{trip.title}</div>
            <div style={{fontSize:11,color:'var(--gray-400)'}}>{trip.location} · {formatDate(trip.startDate, trip.endDate)} · {nights}박{nights+1}일</div>
          </div>
          <span className={`badge ${trip.status==='upcoming'?'badge-purple':'badge-teal'}`}>
            {trip.status==='upcoming' ? dd : '완료'}
          </span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:4}}>
            {trip.members.map(m => (
              <div key={m.id} className="avatar" style={{background:m.color,color:m.textColor,width:26,height:26,fontSize:11}}>{m.initials}</div>
            ))}
            <div style={{fontSize:11,color:'var(--gray-400)',alignSelf:'center',marginLeft:4}}>{trip.members.length}명</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--gray-400)'}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            {totalExpense > 0 ? totalExpense.toLocaleString()+'원' : '지출 없음'}
          </div>
        </div>
      </div>
    </div>
  )
}
