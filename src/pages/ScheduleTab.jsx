import React, { useState } from 'react'
import { categoryConfig } from '../data/sampleData'

function getDates(startDate, endDate) {
  if (!startDate || !endDate) return []
  const dates = []
  const cur = new Date(startDate)
  const end = new Date(endDate)
  const DAY = ['일','월','화','수','목','금','토']
  while (cur <= end) {
    dates.push({
      key: cur.toISOString().split('T')[0],
      label: `${cur.getMonth()+1}/${cur.getDate()} (${DAY[cur.getDay()]})`
    })
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const TRANSPORT_TYPES = [
  { key:'flight',  label:'항공', icon:'✈️' },
  { key:'train',   label:'기차', icon:'🚄' },
  { key:'bus',     label:'버스', icon:'🚌' },
  { key:'car',     label:'자동차', icon:'🚗' },
  { key:'ferry',   label:'페리', icon:'⛴️' },
  { key:'subway',  label:'지하철', icon:'🚇' },
  { key:'taxi',    label:'택시', icon:'🚕' },
]

const SECTION_TABS = [
  { key:'timeline', label:'일정', icon:'🕐' },
  { key:'transport', label:'교통편', icon:'✈️' },
  { key:'stay', label:'숙소', icon:'🏨' },
  { key:'place', label:'여행지', icon:'📍' },
]

export default function ScheduleTab({ trip, onUpdate }) {
  const dates = getDates(trip.startDate, trip.endDate)
  const [activeDate, setActiveDate] = useState(dates[0]?.key || '')
  const [section, setSection] = useState('timeline')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('timeline')

  const [timelineForm, setTimelineForm] = useState({ time:'', title:'', note:'', category:'sightseeing' })
  const [transportForm, setTransportForm] = useState({ type:'flight', from:'', to:'', departTime:'', arriveTime:'', code:'', note:'' })
  const [stayForm, setStayForm] = useState({ name:'', checkIn:'', checkOut:'', confirmNo:'', address:'', note:'' })
  const [placeForm, setPlaceForm] = useState({ name:'', address:'', note:'', mapQuery:'' })

  const dayData = {
    timelines: (trip.schedules||[]).filter(s => s.date?.split('T')[0] === activeDate).sort((a,b)=>(a.time||'').localeCompare(b.time||'')),
    transports: (trip.transports||[]).filter(t => t.date === activeDate),
    stays: (trip.stays||[]).filter(s => s.checkIn === activeDate || (s.checkIn <= activeDate && s.checkOut >= activeDate)),
    places: (trip.places||[]).filter(p => p.date === activeDate),
  }

  function openModal(type) { setModalType(type); setShowModal(true) }

  function addTimeline() {
    if (!timelineForm.title) return
    onUpdate({ ...trip, schedules: [...(trip.schedules||[]), { id:Date.now(), date:activeDate, ...timelineForm }] })
    setTimelineForm({ time:'', title:'', note:'', category:'sightseeing' })
    setShowModal(false)
  }

  function addTransport() {
    if (!transportForm.from || !transportForm.to) return
    onUpdate({ ...trip, transports: [...(trip.transports||[]), { id:Date.now(), date:activeDate, ...transportForm }] })
    setTransportForm({ type:'flight', from:'', to:'', departTime:'', arriveTime:'', code:'', note:'' })
    setShowModal(false)
  }

  function addStay() {
    if (!stayForm.name) return
    onUpdate({ ...trip, stays: [...(trip.stays||[]), { id:Date.now(), ...stayForm }] })
    setStayForm({ name:'', checkIn:'', checkOut:'', confirmNo:'', address:'', note:'' })
    setShowModal(false)
  }

  function addPlace() {
    if (!placeForm.name) return
    onUpdate({ ...trip, places: [...(trip.places||[]), { id:Date.now(), date:activeDate, ...placeForm }] })
    setPlaceForm({ name:'', address:'', note:'', mapQuery:'' })
    setShowModal(false)
  }

  function openGoogleMap(query, address) {
    const q = query || address || ''
    window.open(`https://maps.google.com/?q=${encodeURIComponent(q)}`, '_blank')
  }

  if (dates.length === 0) {
    return (
      <div style={{display:'flex',flexDirection:'column',flex:1}}>
        <div className="app-header"><h1>일정</h1></div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,color:'var(--gray-400)',padding:'20px',textAlign:'center'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div style={{fontSize:14}}>여행 날짜를 설정해주세요</div>
          <div style={{fontSize:12}}>설정 → 여행 관리에서 날짜를 입력하면 일정을 추가할 수 있어요</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* 날짜 탭 */}
      <div style={{display:'flex',background:'var(--white)',borderBottom:'1px solid var(--gray-200)',overflowX:'auto',flexShrink:0}}>
        {dates.map(d => (
          <button key={d.key} onClick={() => setActiveDate(d.key)}
            style={{flex:'0 0 auto',padding:'10px 12px',fontSize:12,fontWeight:500,
              color:activeDate===d.key?'var(--purple)':'var(--gray-400)',
              borderBottom:activeDate===d.key?'2px solid var(--purple)':'2px solid transparent',
              background:'none',whiteSpace:'nowrap'}}>
            {d.label}
          </button>
        ))}
      </div>

      {/* 섹션 탭 */}
      <div style={{display:'flex',background:'var(--gray-50)',borderBottom:'1px solid var(--gray-200)',flexShrink:0}}>
        {SECTION_TABS.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            style={{flex:1,padding:'8px 4px',fontSize:11,fontWeight:500,
              color:section===s.key?'var(--purple)':'var(--gray-400)',
              background:section===s.key?'var(--white)':'transparent',
              borderBottom:section===s.key?'2px solid var(--purple)':'2px solid transparent',
              display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <span style={{fontSize:14}}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="screen" style={{background:'var(--white)'}}>

        {/* 일정 타임라인 */}
        {section === 'timeline' && (
          <>
            {dayData.timelines.length === 0 && (
              <div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>
                이 날 일정이 없어요
              </div>
            )}
            {dayData.timelines.map((item, idx) => {
              const cat = categoryConfig[item.category] || categoryConfig.etc
              return (
                <div key={item.id} style={{display:'flex',gap:10,marginBottom:4}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:12}}>
                    <div className="timeline-dot" style={{background:cat.color,marginTop:18}} />
                    {idx < dayData.timelines.length-1 && <div className="timeline-line" />}
                  </div>
                  <div style={{flex:1,paddingBottom:16}}>
                    <div style={{fontSize:11,color:'var(--gray-400)',marginBottom:3}}>{item.time||'시간 미정'}</div>
                    <div className="card" style={{marginBottom:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:item.note?4:0}}>
                        <span style={{fontSize:13,fontWeight:600}}>{item.title}</span>
                        <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:cat.bg,color:cat.color,fontWeight:500,whiteSpace:'nowrap',marginLeft:8}}>{cat.icon} {cat.label}</span>
                      </div>
                      {item.note && <div style={{fontSize:11,color:'var(--gray-600)'}}>{item.note}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
            <AddBtn onClick={() => openModal('timeline')} label="일정 추가" />
          </>
        )}

        {/* 교통편 */}
        {section === 'transport' && (
          <>
            {dayData.transports.length === 0 && (
              <div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>
                이 날 교통편이 없어요
              </div>
            )}
            {dayData.transports.map(t => {
              const ttype = TRANSPORT_TYPES.find(x => x.key === t.type) || TRANSPORT_TYPES[0]
              return (
                <div key={t.id} className="card">
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'var(--purple-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ttype.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{ttype.label}</div>
                      {t.code && <div style={{fontSize:11,color:'var(--gray-400)'}}>편명/번호: {t.code}</div>}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--gray-50)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{textAlign:'center',flex:1}}>
                      <div style={{fontSize:15,fontWeight:700}}>{t.from}</div>
                      {t.departTime && <div style={{fontSize:11,color:'var(--gray-400)'}}>{t.departTime}</div>}
                    </div>
                    <div style={{color:'var(--purple)',fontSize:18}}>→</div>
                    <div style={{textAlign:'center',flex:1}}>
                      <div style={{fontSize:15,fontWeight:700}}>{t.to}</div>
                      {t.arriveTime && <div style={{fontSize:11,color:'var(--gray-400)'}}>{t.arriveTime}</div>}
                    </div>
                  </div>
                  {t.note && <div style={{fontSize:11,color:'var(--gray-600)',marginTop:8}}>{t.note}</div>}
                </div>
              )
            })}
            <AddBtn onClick={() => openModal('transport')} label="교통편 추가" />
          </>
        )}

        {/* 숙소 */}
        {section === 'stay' && (
          <>
            {dayData.stays.length === 0 && (
              <div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>
                이 날 숙소 정보가 없어요
              </div>
            )}
            {dayData.stays.map(s => (
              <div key={s.id} className="card">
                <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🏨</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600}}>{s.name}</div>
                    {s.address && (
                      <button onClick={() => openGoogleMap(s.name, s.address)}
                        style={{fontSize:11,color:'var(--purple)',background:'none',border:'none',padding:0,display:'flex',alignItems:'center',gap:3,marginTop:2,cursor:'pointer'}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {s.address} · 지도 보기
                      </button>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {s.checkIn && (
                    <div style={{flex:1,background:'var(--gray-50)',borderRadius:8,padding:'8px 10px'}}>
                      <div style={{fontSize:10,color:'var(--gray-400)',marginBottom:2}}>체크인</div>
                      <div style={{fontSize:13,fontWeight:500}}>{s.checkIn}</div>
                    </div>
                  )}
                  {s.checkOut && (
                    <div style={{flex:1,background:'var(--gray-50)',borderRadius:8,padding:'8px 10px'}}>
                      <div style={{fontSize:10,color:'var(--gray-400)',marginBottom:2}}>체크아웃</div>
                      <div style={{fontSize:13,fontWeight:500}}>{s.checkOut}</div>
                    </div>
                  )}
                </div>
                {s.confirmNo && (
                  <div style={{marginTop:8,padding:'7px 10px',background:'var(--purple-light)',borderRadius:8,fontSize:12,color:'var(--purple)'}}>
                    예약번호: <strong>{s.confirmNo}</strong>
                  </div>
                )}
                {s.note && <div style={{fontSize:11,color:'var(--gray-600)',marginTop:8}}>{s.note}</div>}
              </div>
            ))}
            <AddBtn onClick={() => openModal('stay')} label="숙소 추가" />
          </>
        )}

        {/* 여행지 */}
        {section === 'place' && (
          <>
            {dayData.places.length === 0 && (
              <div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>
                이 날 방문할 여행지가 없어요
              </div>
            )}
            {dayData.places.map((p, idx) => (
              <div key={p.id} className="card">
                <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'var(--red-light)',color:'var(--red)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0}}>{idx+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{p.name}</div>
                    {p.address && <div style={{fontSize:11,color:'var(--gray-400)',marginBottom:6}}>{p.address}</div>}
                    {p.note && <div style={{fontSize:12,color:'var(--gray-600)',marginBottom:8}}>{p.note}</div>}
                    <button
                      onClick={() => openGoogleMap(p.mapQuery || p.name, p.address)}
                      style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:'#4285F4',color:'#fff',borderRadius:8,fontSize:12,fontWeight:500,border:'none',cursor:'pointer'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      구글 지도에서 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <AddBtn onClick={() => openModal('place')} label="여행지 추가" />
          </>
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{maxHeight:'85vh',overflowY:'auto'}}>

            {/* 일정 추가 */}
            {modalType === 'timeline' && (
              <>
                <div className="modal-title">🕐 일정 추가 — {dates.find(d=>d.key===activeDate)?.label}</div>
                <div className="form-group">
                  <label className="form-label">시간</label>
                  <input className="form-input" type="time" value={timelineForm.time} onChange={e=>setTimelineForm({...timelineForm,time:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">제목 *</label>
                  <input className="form-input" placeholder="예: 오사카성 관광" value={timelineForm.title} onChange={e=>setTimelineForm({...timelineForm,title:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <select className="form-input" value={timelineForm.category} onChange={e=>setTimelineForm({...timelineForm,category:e.target.value})}>
                    {Object.entries(categoryConfig).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">메모</label>
                  <input className="form-input" placeholder="추가 메모" value={timelineForm.note} onChange={e=>setTimelineForm({...timelineForm,note:e.target.value})} />
                </div>
                <button className="btn-primary" onClick={addTimeline}>추가하기</button>
              </>
            )}

            {/* 교통편 추가 */}
            {modalType === 'transport' && (
              <>
                <div className="modal-title">✈️ 교통편 추가 — {dates.find(d=>d.key===activeDate)?.label}</div>
                <div className="form-group">
                  <label className="form-label">교통 수단</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {TRANSPORT_TYPES.map(t => (
                      <button key={t.key} onClick={() => setTransportForm({...transportForm,type:t.key})}
                        style={{padding:'6px 10px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',
                          background:transportForm.type===t.key?'var(--purple)':'var(--gray-100)',
                          color:transportForm.type===t.key?'#fff':'var(--gray-600)'}}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">출발지 *</label>
                    <input className="form-input" placeholder="예: 인천공항" value={transportForm.from} onChange={e=>setTransportForm({...transportForm,from:e.target.value})} />
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">도착지 *</label>
                    <input className="form-input" placeholder="예: 오사카 간사이" value={transportForm.to} onChange={e=>setTransportForm({...transportForm,to:e.target.value})} />
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">출발 시간</label>
                    <input className="form-input" type="time" value={transportForm.departTime} onChange={e=>setTransportForm({...transportForm,departTime:e.target.value})} />
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">도착 시간</label>
                    <input className="form-input" type="time" value={transportForm.arriveTime} onChange={e=>setTransportForm({...transportForm,arriveTime:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">편명 / 예약번호</label>
                  <input className="form-input" placeholder="예: OZ111, KTX 123" value={transportForm.code} onChange={e=>setTransportForm({...transportForm,code:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">메모</label>
                  <input className="form-input" placeholder="탑승 게이트, 좌석 등" value={transportForm.note} onChange={e=>setTransportForm({...transportForm,note:e.target.value})} />
                </div>
                <button className="btn-primary" onClick={addTransport}>추가하기</button>
              </>
            )}

            {/* 숙소 추가 */}
            {modalType === 'stay' && (
              <>
                <div className="modal-title">🏨 숙소 추가</div>
                <div className="form-group">
                  <label className="form-label">숙소 이름 *</label>
                  <input className="form-input" placeholder="예: 도톤보리 게스트하우스" value={stayForm.name} onChange={e=>setStayForm({...stayForm,name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">주소 (지도 연결용)</label>
                  <input className="form-input" placeholder="예: 오사카 주오구 도톤보리" value={stayForm.address} onChange={e=>setStayForm({...stayForm,address:e.target.value})} />
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">체크인 날짜</label>
                    <input className="form-input" type="date" value={stayForm.checkIn} onChange={e=>setStayForm({...stayForm,checkIn:e.target.value})} />
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">체크아웃 날짜</label>
                    <input className="form-input" type="date" value={stayForm.checkOut} onChange={e=>setStayForm({...stayForm,checkOut:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">예약 확인번호</label>
                  <input className="form-input" placeholder="예: ABCD1234" value={stayForm.confirmNo} onChange={e=>setStayForm({...stayForm,confirmNo:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">메모</label>
                  <input className="form-input" placeholder="체크인 시간, 조식 여부 등" value={stayForm.note} onChange={e=>setStayForm({...stayForm,note:e.target.value})} />
                </div>
                <button className="btn-primary" onClick={addStay}>추가하기</button>
              </>
            )}

            {/* 여행지 추가 */}
            {modalType === 'place' && (
              <>
                <div className="modal-title">📍 여행지 추가 — {dates.find(d=>d.key===activeDate)?.label}</div>
                <div className="form-group">
                  <label className="form-label">장소 이름 *</label>
                  <input className="form-input" placeholder="예: 오사카성" value={placeForm.name} onChange={e=>setPlaceForm({...placeForm,name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">주소</label>
                  <input className="form-input" placeholder="예: 오사카 주오구 오사카조" value={placeForm.address} onChange={e=>setPlaceForm({...placeForm,address:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">구글 지도 검색어 (비워두면 이름으로 검색)</label>
                  <input className="form-input" placeholder="예: Osaka Castle Japan" value={placeForm.mapQuery} onChange={e=>setPlaceForm({...placeForm,mapQuery:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">메모</label>
                  <input className="form-input" placeholder="입장료, 운영 시간 등" value={placeForm.note} onChange={e=>setPlaceForm({...placeForm,note:e.target.value})} />
                </div>
                <button className="btn-primary" onClick={addPlace}>추가하기</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick}
      style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      {label}
    </button>
  )
}
