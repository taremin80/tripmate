import React from 'react'

function dday(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  if (diff > 0) return 'D-' + diff
  if (diff === 0) return 'D-Day'
  return '완료'
}

function formatDate(s, e) {
  const fmt = d => (d.getMonth()+1) + '/' + d.getDate()
  return fmt(new Date(s)) + ' — ' + fmt(new Date(e))
}

function getEffectiveStatus(trip) {
  if (trip.status === 'done') return 'done'
  if (trip.endDate) {
    const end = new Date(trip.endDate)
    end.setHours(23, 59, 59)
    if (end < new Date()) return 'done'
  }
  return 'upcoming'
}

export default function HomeScreen({ trips, onSelect, onAdd, onSettings }) {
  const upcoming = trips.filter(t => getEffectiveStatus(t) === 'upcoming')
  const done = trips.filter(t => getEffectiveStatus(t) === 'done')
  const totalExpenseAll = trips.reduce((s, t) => s + t.expenses.reduce((a, e) => a + e.amount, 0), 0)

  const stats = [
    { label: '총 여행',    value: trips.length + '회' },
    { label: '완료한 여행', value: done.length + '회' },
    { label: '총 경비',    value: totalExpenseAll > 0 ? Math.floor(totalExpenseAll/10000) + '만원' : '0원' },
  ]

  return (
    <>
      {/* 헤더 */}
      <div style={{background:'var(--purple)',display:'flex',flexDirection:'column',minHeight:180}}>

        {/* 상단: 로고 + 설정버튼 */}
        <div style={{padding:'16px 16px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{color:'#fff',fontWeight:700,fontSize:18,letterSpacing:-.5,lineHeight:1}}>TripMate</div>
              <div style={{color:'rgba(255,255,255,.7)',fontSize:10,letterSpacing:.5}}>우리들의 여행 기록</div>
            </div>
          </div>
          <button onClick={onSettings}
            style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.2)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* 빈 공간 — 통계를 하단으로 밀기 */}
        <div style={{flex:1}} />

        {/* 통계 3개 — 헤더 맨 아래 */}
        <div style={{display:'flex',gap:8,padding:'0 16px 16px'}}>
          {stats.map(s => (
            <div key={s.label} style={{flex:1,textAlign:'center',background:'rgba(255,255,255,.15)',borderRadius:10,padding:'8px 4px'}}>
              <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{s.value}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.75)',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 여행 목록 */}
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
        {trips.length === 0 && (
          <div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>
            여행을 추가해보세요!
          </div>
        )}
        <button onClick={onAdd}
          style={{width:'100%',padding:'14px',borderRadius:12,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:4,cursor:'pointer'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          새 여행 만들기
        </button>
      </div>
    </>
  )
}

function TripCard({ trip, onSelect }) {
  const status = getEffectiveStatus(trip)
  const dd = dday(trip.startDate)
  const totalExpense = trip.expenses.reduce((s, e) => s + e.amount, 0)
  const nights = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) : 0

  return (
    <div className="card" onClick={() => onSelect(trip)}
      style={{cursor:'pointer',overflow:'hidden',padding:0}}>
      <div style={{height:4,background:trip.coverColor}} />
      <div style={{padding:'12px 14px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{trip.title}</div>
            <div style={{fontSize:11,color:'var(--gray-400)'}}>
              {trip.location}
              {trip.startDate ? ' · ' + formatDate(trip.startDate, trip.endDate) + ' · ' + nights + '박' + (nights+1) + '일' : ''}
            </div>
          </div>
          <span className={'badge ' + (status==='upcoming' ? 'badge-purple' : 'badge-teal')}>
            {status==='upcoming' ? dd : '완료'}
          </span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:4}}>
            {trip.members.map(m => (
              <div key={m.id} className="avatar" style={{background:m.color,color:m.textColor,width:26,height:26,fontSize:11}}>{m.initials}</div>
            ))}
            <div style={{fontSize:11,color:'var(--gray-400)',alignSelf:'center',marginLeft:4}}>{trip.members.length}명</div>
          </div>
          <div style={{fontSize:11,color:'var(--gray-400)'}}>
            {totalExpense > 0 ? '₩' + totalExpense.toLocaleString() : '지출 없음'}
          </div>
        </div>
      </div>
    </div>
  )
}
