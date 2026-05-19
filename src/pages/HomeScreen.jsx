import React, { useState, useRef } from 'react'

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

const DEFAULT_BG = ''

function getEffectiveStatus(trip) {
  if (trip.status === 'done') return 'done'
  if (trip.endDate) {
    const end = new Date(trip.endDate)
    end.setHours(23, 59, 59)
    if (end < new Date()) return 'done'
  }
  return 'upcoming'
}

export default function HomeScreen({ trips, onSelect, onAdd, onSettings, bgImage, onSaveBg }) {
  const upcoming = trips.filter(t => getEffectiveStatus(t) === 'upcoming')
  const done = trips.filter(t => getEffectiveStatus(t) === 'done')
  const totalExpenseAll = trips.reduce((s, t) => s + t.expenses.reduce((a, e) => a + e.amount, 0), 0)

  const [showBgModal, setShowBgModal] = useState(false)
  const [bgUrl, setBgUrl] = useState('')
  const fileInputRef = useRef(null)

  function applyBg(url) {
    onSaveBg(url)
    setShowBgModal(false)
    setBgUrl('')
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => applyBg(ev.target.result)
    reader.readAsDataURL(file)
  }

  function removeBg() {
    onSaveBg('')
    setShowBgModal(false)
  }

  return (
    <>
      {/* 히어로 헤더 */}
      <div style={{
        position:'relative', minHeight:200, overflow:'hidden',
        background: bgImage ? 'none' : 'linear-gradient(135deg, #5B4FCF 0%, #7B6FEF 100%)',
      }}>
        {/* 배경 이미지 */}
        {bgImage && (
          <img src={bgImage} alt="배경"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
        )}
        {/* 어두운 오버레이 */}
        <div style={{
          position:'absolute', inset:0,
          background: bgImage
            ? 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 100%)'
            : 'none'
        }} />

        {/* 컨텐츠 */}
        <div style={{position:'relative',zIndex:1,padding:'16px 16px 20px'}}>
          {/* 상단 바 */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            {/* 로고 */}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{
                width:34, height:34, borderRadius:10,
                background:'rgba(255,255,255,.22)',
                display:'flex', alignItems:'center', justifyContent:'center',
                backdropFilter:'blur(4px)',
              }}>
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
            {/* 버튼들 */}
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => setShowBgModal(true)}
                style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.2)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <button onClick={onSettings}
                style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.2)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </button>
            </div>
          </div>

          {/* 통계 */}
          <div style={{display:'flex',gap:10}}>
            {[
              { label:'총 여행', value: trips.length+'회' },
              { label:'완료한 여행', value: done.length+'회' },
              { label:'총 경비', value: totalExpenseAll > 0 ? (totalExpenseAll/10000).toFixed(0)+'만원' : '0원' },
            ].map(s => (
              <div key={s.label} style={{flex:1,textAlign:'center',background:'rgba(255,255,255,.15)',borderRadius:10,padding:'8px 4px',backdropFilter:'blur(4px)'}}>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{s.value}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.75)',marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
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
          style={{width:'100%',padding:'14px',borderRadius:12,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:4}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          새 여행 만들기
        </button>
      </div>

      {/* 배경 변경 모달 */}
      {showBgModal && (
        <div className="modal-overlay" onClick={() => setShowBgModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🖼️ 배경 사진 변경</div>

            {/* 앨범에서 선택 */}
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()}
              style={{width:'100%',padding:'14px',borderRadius:12,border:'1.5px solid var(--purple)',background:'var(--purple-light)',color:'var(--purple)',fontSize:14,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              📱 앨범에서 사진 선택
            </button>

            <div style={{textAlign:'center',fontSize:12,color:'var(--gray-400)',margin:'8px 0'}}>또는 URL로 입력</div>

            <div className="form-group">
              <label className="form-label">이미지 URL</label>
              <input className="form-input" placeholder="https://..." value={bgUrl} onChange={e => setBgUrl(e.target.value)} />
            </div>
            {bgUrl && (
              <div style={{borderRadius:10,overflow:'hidden',marginBottom:12,height:120}}>
                <img src={bgUrl} alt="미리보기" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e => e.target.style.opacity='.3'} />
              </div>
            )}
            <button className="btn-primary" onClick={() => bgUrl && applyBg(bgUrl)} style={{marginBottom:8,opacity:bgUrl?1:.5}}>
              URL 사진 적용
            </button>
            {bgImage && (
              <button onClick={removeBg}
                style={{width:'100%',padding:'11px',borderRadius:8,background:'var(--red-light)',color:'var(--red)',fontSize:13,fontWeight:500,border:'none'}}>
                배경 사진 제거
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function TripCard({ trip, onSelect }) {
  const dd = dday(trip.startDate)
  const totalExpense = trip.expenses.reduce((s, e) => s + e.amount, 0)
  const nights = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000)
    : 0

  return (
    <div className="card" onClick={() => onSelect(trip)}
      style={{cursor:'pointer',overflow:'hidden',padding:0}}>
      <div style={{height:4,background:trip.coverColor}} />
      <div style={{padding:'12px 14px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{trip.title}</div>
            <div style={{fontSize:11,color:'var(--gray-400)'}}>
              {trip.location}{trip.startDate ? ` · ${formatDate(trip.startDate, trip.endDate)} · ${nights}박${nights+1}일` : ''}
            </div>
          </div>
          <span className={`badge ${getEffectiveStatus(trip)==='upcoming'?'badge-purple':'badge-teal'}`}>
            {getEffectiveStatus(trip)==='upcoming' ? dd : '완료'}
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
            {totalExpense > 0 ? '₩'+totalExpense.toLocaleString() : '지출 없음'}
          </div>
        </div>
      </div>
    </div>
  )
}
