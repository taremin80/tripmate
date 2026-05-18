import React, { useState } from 'react'

const THEMES = [
  { key:'purple', label:'보라', color:'#5B4FCF' },
  { key:'teal',   label:'청록', color:'#0F9B8E' },
  { key:'coral',  label:'코랄', color:'#E07B39' },
  { key:'navy',   label:'네이비', color:'#1E3A5F' },
  { key:'rose',   label:'로즈', color:'#C2185B' },
]

export default function SettingsScreen({ trips, onBack, onUpdateTrips, appSettings, onUpdateSettings }) {
  const [tab, setTab] = useState('app')
  const [editTrip, setEditTrip] = useState(null)
  const [memberForm, setMemberForm] = useState({ name:'', initials:'' })
  const [showMemberModal, setShowMemberModal] = useState(false)

  const MEMBER_COLORS = [
    { color:'#EEEDFE', textColor:'#3D35A0' },
    { color:'#E1F5EE', textColor:'#0F6E56' },
    { color:'#FAEEDA', textColor:'#854F0B' },
    { color:'#FCEBEB', textColor:'#791F1F' },
    { color:'#EAF3DE', textColor:'#27500A' },
  ]

  function addMember() {
    if (!memberForm.name || !editTrip) return
    const usedColors = editTrip.members.length
    const colorSet = MEMBER_COLORS[usedColors % MEMBER_COLORS.length]
    const newMember = {
      id: Date.now(),
      name: memberForm.name,
      initials: memberForm.initials || memberForm.name.slice(0,1),
      ...colorSet
    }
    const updated = { ...editTrip, members: [...editTrip.members, newMember] }
    setEditTrip(updated)
    onUpdateTrips(trips.map(t => t.id === updated.id ? updated : t))
    setMemberForm({ name:'', initials:'' })
    setShowMemberModal(false)
  }

  function removeMember(memberId) {
    if (!editTrip) return
    const updated = { ...editTrip, members: editTrip.members.filter(m => m.id !== memberId) }
    setEditTrip(updated)
    onUpdateTrips(trips.map(t => t.id === updated.id ? updated : t))
  }

  function deleteTrip(tripId) {
    if (!window.confirm('이 여행을 삭제할까요?')) return
    onUpdateTrips(trips.filter(t => t.id !== tripId))
    setEditTrip(null)
  }

  function toggleTripStatus(trip) {
    const updated = { ...trip, status: trip.status === 'upcoming' ? 'done' : 'upcoming' }
    onUpdateTrips(trips.map(t => t.id === updated.id ? updated : t))
    setEditTrip(updated)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      {/* 헤더 */}
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <button onClick={onBack} style={{color:'#fff',display:'flex',alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1>설정</h1>
        <div style={{width:20}} />
      </div>

      {/* 탭 */}
      <div style={{display:'flex',borderBottom:'1px solid var(--gray-200)',background:'var(--white)'}}>
        {[['app','앱 설정'],['trips','여행 관리']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{flex:1,padding:'11px',fontSize:13,fontWeight:tab===k?600:400,
              color:tab===k?'var(--purple)':'var(--gray-400)',
              borderBottom:tab===k?'2px solid var(--purple)':'2px solid transparent',background:'none'}}>
            {l}
          </button>
        ))}
      </div>

      <div className="screen">

        {/* 앱 설정 탭 */}
        {tab === 'app' && (
          <>
            <div className="section-label">내 프로필</div>
            <div className="card">
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div style={{width:50,height:50,borderRadius:'50%',background:'var(--purple-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:'var(--purple)'}}>
                  {(appSettings.userName||'나').slice(0,1)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{appSettings.userName || '내 이름 설정'}</div>
                  <div style={{fontSize:11,color:'var(--gray-400)'}}>여행 멤버에서 표시되는 이름</div>
                </div>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">이름</label>
                <input className="form-input" placeholder="이름을 입력하세요" value={appSettings.userName||''} onChange={e => onUpdateSettings({...appSettings, userName:e.target.value})} />
              </div>
            </div>

            <div className="section-label">테마 색상</div>
            <div className="card">
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {THEMES.map(t => (
                  <button key={t.key} onClick={() => onUpdateSettings({...appSettings, theme:t.key})}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,background:'none',padding:4}}>
                    <div style={{width:40,height:40,borderRadius:12,background:t.color,
                      outline: appSettings.theme===t.key ? `3px solid ${t.color}` : 'none',
                      outlineOffset:3, boxShadow: appSettings.theme===t.key ? '0 0 0 1px #fff inset':''}} />
                    <span style={{fontSize:10,color:appSettings.theme===t.key?t.color:'var(--gray-400)',fontWeight:appSettings.theme===t.key?600:400}}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="section-label">통화 설정</div>
            <div className="card">
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">기본 통화</label>
                <select className="form-input" value={appSettings.currency||'KRW'} onChange={e => onUpdateSettings({...appSettings,currency:e.target.value})}>
                  <option value="KRW">🇰🇷 원 (KRW)</option>
                  <option value="JPY">🇯🇵 엔 (JPY)</option>
                  <option value="USD">🇺🇸 달러 (USD)</option>
                  <option value="EUR">🇪🇺 유로 (EUR)</option>
                  <option value="THB">🇹🇭 바트 (THB)</option>
                </select>
              </div>
            </div>

            <div className="section-label">앱 정보</div>
            <div className="card">
              {[
                { label:'버전', value:'1.0.0' },
                { label:'총 여행 수', value: trips.length+'개' },
                { label:'총 지출 기록', value: trips.reduce((s,t)=>s+t.expenses.length,0)+'건' },
              ].map((item,i) => (
                <div key={item.label} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderTop:i>0?'1px solid var(--gray-100)':'none'}}>
                  <span style={{fontSize:13,color:'var(--gray-600)'}}>{item.label}</span>
                  <span style={{fontSize:13,fontWeight:500}}>{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 여행 관리 탭 */}
        {tab === 'trips' && !editTrip && (
          <>
            <div className="section-label">여행 목록 관리</div>
            {trips.map(trip => (
              <div key={trip.id} className="card" style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:trip.coverColor,flexShrink:0}} />
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{trip.title}</div>
                  <div style={{fontSize:11,color:'var(--gray-400)'}}>{trip.members.length}명 · {trip.expenses.length}건 지출</div>
                </div>
                <button onClick={() => setEditTrip(trip)}
                  style={{fontSize:12,color:'var(--purple)',padding:'5px 10px',border:'1px solid var(--purple-light)',borderRadius:8,background:'var(--purple-light)'}}>
                  관리
                </button>
              </div>
            ))}
          </>
        )}

        {/* 여행 상세 관리 */}
        {tab === 'trips' && editTrip && (
          <>
            <button onClick={() => setEditTrip(null)} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,color:'var(--purple)',marginBottom:12}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
              목록으로
            </button>

            <div className="section-label">여행 정보</div>
            <div className="card">
              <div className="form-group">
                <label className="form-label">여행 이름</label>
                <input className="form-input" value={editTrip.title} onChange={e => {
                  const u = {...editTrip, title:e.target.value}
                  setEditTrip(u)
                  onUpdateTrips(trips.map(t => t.id===u.id?u:t))
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">목적지</label>
                <input className="form-input" value={editTrip.location} onChange={e => {
                  const u = {...editTrip, location:e.target.value}
                  setEditTrip(u)
                  onUpdateTrips(trips.map(t => t.id===u.id?u:t))
                }} />
              </div>
              <div style={{display:'flex',gap:8}}>
                <div className="form-group" style={{flex:1,marginBottom:0}}>
                  <label className="form-label">출발일</label>
                  <input className="form-input" type="date" value={editTrip.startDate} onChange={e => {
                    const u = {...editTrip, startDate:e.target.value}
                    setEditTrip(u)
                    onUpdateTrips(trips.map(t => t.id===u.id?u:t))
                  }} />
                </div>
                <div className="form-group" style={{flex:1,marginBottom:0}}>
                  <label className="form-label">귀국일</label>
                  <input className="form-input" type="date" value={editTrip.endDate} onChange={e => {
                    const u = {...editTrip, endDate:e.target.value}
                    setEditTrip(u)
                    onUpdateTrips(trips.map(t => t.id===u.id?u:t))
                  }} />
                </div>
              </div>
            </div>

            <div className="section-label" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>멤버 관리</span>
              <button onClick={() => setShowMemberModal(true)} style={{fontSize:11,color:'var(--purple)',fontWeight:500}}>+ 추가</button>
            </div>
            <div className="card">
              {editTrip.members.map((m,i) => (
                <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderTop:i>0?'1px solid var(--gray-100)':'none'}}>
                  <div className="avatar" style={{background:m.color,color:m.textColor}}>{m.initials}</div>
                  <span style={{flex:1,fontSize:13}}>{m.name}</span>
                  {m.id !== 1 && (
                    <button onClick={() => removeMember(m.id)} style={{color:'var(--red)',fontSize:12,padding:'4px 8px',border:'1px solid var(--red-light)',borderRadius:6,background:'var(--red-light)'}}>삭제</button>
                  )}
                  {m.id === 1 && <span style={{fontSize:11,color:'var(--gray-400)'}}>나</span>}
                </div>
              ))}
            </div>

            <div className="section-label">상태 변경</div>
            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>현재 상태</div>
                  <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>{editTrip.status==='upcoming'?'다가오는 여행':'완료된 여행'}</div>
                </div>
                <button onClick={() => toggleTripStatus(editTrip)}
                  style={{fontSize:12,padding:'7px 12px',borderRadius:8,
                    background:editTrip.status==='upcoming'?'var(--teal-light)':'var(--purple-light)',
                    color:editTrip.status==='upcoming'?'var(--teal)':'var(--purple)',
                    border:'none',fontWeight:500}}>
                  {editTrip.status==='upcoming' ? '완료로 변경' : '예정으로 변경'}
                </button>
              </div>
            </div>

            <div className="section-label">위험 구역</div>
            <div className="card">
              <button onClick={() => deleteTrip(editTrip.id)}
                style={{width:'100%',padding:'11px',borderRadius:8,background:'var(--red-light)',color:'var(--red)',fontSize:13,fontWeight:500,border:'none'}}>
                이 여행 삭제하기
              </button>
            </div>
          </>
        )}
      </div>

      {/* 멤버 추가 모달 */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">멤버 추가</div>
            <div className="form-group">
              <label className="form-label">이름 *</label>
              <input className="form-input" placeholder="예: 이지수" value={memberForm.name} onChange={e => setMemberForm({...memberForm,name:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">표시 이름 (1~2글자)</label>
              <input className="form-input" placeholder="예: 지 (비워두면 자동)" maxLength={2} value={memberForm.initials} onChange={e => setMemberForm({...memberForm,initials:e.target.value})} />
            </div>
            <button className="btn-primary" onClick={addMember}>추가하기</button>
          </div>
        </div>
      )}
    </div>
  )
}
