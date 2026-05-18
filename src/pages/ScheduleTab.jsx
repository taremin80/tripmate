import React, { useState } from 'react'

function getDates(startDate, endDate) {
  if (!startDate || !endDate) return []
  const dates = []
  const cur = new Date(startDate)
  const end = new Date(endDate)
  const DAY = ['일','월','화','수','목','금','토']
  while (cur <= end) {
    dates.push({ key: cur.toISOString().split('T')[0], label: `${cur.getMonth()+1}/${cur.getDate()} (${DAY[cur.getDay()]})` })
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const CATEGORIES = [
  { key:'transport',   label:'교통',    icon:'✈️', color:'#5B4FCF', bg:'#EEEDFE', hasCost:true,  hasPlace:false, hasRoute:true  },
  { key:'food',        label:'식사',    icon:'🍜', color:'#E07B39', bg:'#FEF3E8', hasCost:true,  hasPlace:true,  hasRoute:false },
  { key:'snack',       label:'간식',    icon:'🧁', color:'#E07B39', bg:'#FEF3E8', hasCost:true,  hasPlace:true,  hasRoute:false },
  { key:'sightseeing', label:'관광',    icon:'🗺️', color:'#0F9B8E', bg:'#E0F5F3', hasCost:true,  hasPlace:true,  hasRoute:false },
  { key:'activity',    label:'액티비티',icon:'🎫', color:'#0F9B8E', bg:'#E0F5F3', hasCost:true,  hasPlace:true,  hasRoute:false },
  { key:'shopping',    label:'쇼핑',    icon:'🛍️', color:'#C2185B', bg:'#FCE4EC', hasCost:true,  hasPlace:true,  hasRoute:false },
  { key:'hotel',       label:'숙소',    icon:'🏨', color:'#3A9E6F', bg:'#E5F5EE', hasCost:false, hasPlace:true,  hasRoute:false },
  { key:'etc',         label:'기타',    icon:'📌', color:'#6B6B65', bg:'#F0EFEB', hasCost:true,  hasPlace:false, hasRoute:false },
]

const TRANSPORT_TYPES = [
  { key:'flight', label:'항공',   icon:'✈️' },
  { key:'train',  label:'기차',   icon:'🚄' },
  { key:'bus',    label:'버스',   icon:'🚌' },
  { key:'car',    label:'자동차', icon:'🚗' },
  { key:'ferry',  label:'페리',   icon:'⛴️' },
  { key:'subway', label:'지하철', icon:'🚇' },
  { key:'taxi',   label:'택시',   icon:'🚕' },
  { key:'walk',   label:'도보',   icon:'🚶' },
]

const CURRENCIES = [
  { code:'KRW', symbol:'₩', flag:'🇰🇷' },
  { code:'JPY', symbol:'¥', flag:'🇯🇵' },
  { code:'USD', symbol:'$', flag:'🇺🇸' },
  { code:'EUR', symbol:'€', flag:'🇪🇺' },
  { code:'THB', symbol:'฿', flag:'🇹🇭' },
]

const SECTION_TABS = [
  { key:'timeline',  label:'일정',   icon:'🕐' },
  { key:'transport', label:'교통편', icon:'✈️' },
  { key:'stay',      label:'숙소',   icon:'🏨' },
]

const EMPTY_FORM = {
  time:'', title:'', category:'food',
  place:'', mapQuery:'', note:'',
  transportType:'subway', transportFrom:'', transportTo:'',
  cost:'', currency:'KRW', exchangeRate:'',
  paidBy: null,
}

const TRANSPORT_EMPTY = { type:'flight', from:'', to:'', departTime:'', arriveTime:'', code:'', note:'' }
const STAY_EMPTY = { name:'', checkIn:'', checkOut:'', confirmNo:'', address:'', note:'' }

function toKRW(amount, currency, rate) {
  if (!currency || currency==='KRW') return Number(amount)||0
  return Math.round((Number(amount)||0)*(Number(rate)||1))
}

function MapBtn({ name, mapQuery }) {
  const q = mapQuery||name||''
  if (!q) return null
  return (
    <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(q)}`, '_blank')}
      style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',background:'#4285F4',color:'#fff',borderRadius:6,fontSize:11,fontWeight:500,border:'none',cursor:'pointer'}}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      구글 지도
    </button>
  )
}

function CurrencyBtns({ value, onChange }) {
  return (
    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
      {CURRENCIES.map(c=>(
        <button key={c.code} onClick={()=>onChange(c.code)}
          style={{padding:'4px 9px',borderRadius:16,fontSize:11,border:'none',fontWeight:500,
            background:value===c.code?'var(--purple)':'var(--gray-100)',
            color:value===c.code?'#fff':'var(--gray-600)'}}>
          {c.flag} {c.code}
        </button>
      ))}
    </div>
  )
}

function AmountInput({ currency, value, onChange, exchangeRate, onRateChange }) {
  const sym = CURRENCIES.find(c=>c.code===currency)?.symbol||'₩'
  const needsRate = currency!=='KRW'
  const krw = needsRate&&value&&exchangeRate ? Math.round(Number(value)*Number(exchangeRate)) : null
  return (
    <div>
      <div style={{display:'flex'}}>
        <span style={{padding:'10px 10px',background:'var(--gray-100)',borderRadius:'8px 0 0 8px',fontSize:13,fontWeight:700,color:'var(--gray-600)',border:'1px solid var(--gray-200)',borderRight:'none'}}>{sym}</span>
        <input className="form-input" type="number" placeholder="0" style={{borderRadius:'0 8px 8px 0'}}
          value={value} onChange={e=>onChange(e.target.value)} />
      </div>
      {needsRate&&value&&(
        <div style={{marginTop:6}}>
          <label className="form-label">환율 (1{sym} = ?원)</label>
          <input className="form-input" type="number" placeholder="예: 9.5 (엔), 1350 (달러)"
            value={exchangeRate} onChange={e=>onRateChange(e.target.value)} />
          {krw&&<div style={{fontSize:11,color:'var(--purple)',marginTop:4,fontWeight:600}}>≈ ₩{krw.toLocaleString()}</div>}
        </div>
      )}
    </div>
  )
}

// 카테고리별 추가 입력란
function CategoryFields({ form, f, members }) {
  const cat = CATEGORIES.find(c=>c.key===form.category)||CATEGORIES[0]

  return (
    <>
      {/* 교통 경로 */}
      {cat.hasRoute && (
        <div style={{background:'var(--purple-light)',borderRadius:10,padding:'12px',marginBottom:14}}>
          <label className="form-label" style={{color:'var(--purple)'}}>교통 수단</label>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
            {TRANSPORT_TYPES.map(t=>(
              <button key={t.key} onClick={()=>f({transportType:t.key})}
                style={{padding:'5px 9px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',
                  background:form.transportType===t.key?'var(--purple)':'rgba(255,255,255,.7)',
                  color:form.transportType===t.key?'#fff':'var(--gray-600)'}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <div style={{flex:1}}>
              <label className="form-label">출발지</label>
              <input className="form-input" placeholder="예: 난바역" value={form.transportFrom} onChange={e=>f({transportFrom:e.target.value})} />
            </div>
            <div style={{flex:1}}>
              <label className="form-label">도착지</label>
              <input className="form-input" placeholder="예: 교토역" value={form.transportTo} onChange={e=>f({transportTo:e.target.value})} />
            </div>
          </div>
          <label className="form-label">교통비</label>
          <CurrencyBtns value={form.currency} onChange={v=>f({currency:v,exchangeRate:''})} />
          <AmountInput currency={form.currency} value={form.cost} onChange={v=>f({cost:v})} exchangeRate={form.exchangeRate} onRateChange={v=>f({exchangeRate:v})} />
        </div>
      )}

      {/* 장소 (식사/관광/쇼핑/숙소) */}
      {cat.hasPlace && (
        <div style={{marginBottom:14}}>
          <div className="form-group">
            <label className="form-label">
              {cat.key==='food'||cat.key==='snack' ? '식당 이름' :
               cat.key==='hotel' ? '숙소 이름' :
               cat.key==='shopping' ? '쇼핑 장소' : '장소 이름'}
            </label>
            <input className="form-input"
              placeholder={
                cat.key==='food' ? '예: 이치란 도톤보리점' :
                cat.key==='snack' ? '예: 글리코 편의점' :
                cat.key==='hotel' ? '예: 도톤보리 게스트하우스' :
                cat.key==='shopping' ? '예: 돈키호테 신주쿠점' :
                '예: 오사카성'
              }
              value={form.place} onChange={e=>f({place:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">구글 지도 검색어 (비워두면 장소명으로 검색)</label>
            <input className="form-input" placeholder="예: Osaka Castle Japan" value={form.mapQuery} onChange={e=>f({mapQuery:e.target.value})} />
          </div>
        </div>
      )}

      {/* 비용 (숙소 제외한 hasCost) */}
      {cat.hasCost && !cat.hasRoute && (
        <div style={{background:'var(--gray-50)',borderRadius:10,padding:'12px',marginBottom:14}}>
          <label className="form-label">
            {cat.key==='food'||cat.key==='snack' ? '식사 금액' :
             cat.key==='sightseeing'||cat.key==='activity' ? '입장료 / 비용' :
             cat.key==='shopping' ? '쇼핑 금액' : '금액'}
          </label>
          <CurrencyBtns value={form.currency} onChange={v=>f({currency:v,exchangeRate:''})} />
          <AmountInput currency={form.currency} value={form.cost} onChange={v=>f({cost:v})} exchangeRate={form.exchangeRate} onRateChange={v=>f({exchangeRate:v})} />
        </div>
      )}

      {/* 결제자 (비용 있을 때만) */}
      {cat.hasCost && form.cost && (
        <div className="form-group">
          <label className="form-label">결제한 사람</label>
          <select className="form-input" value={form.paidBy||''} onChange={e=>f({paidBy:parseInt(e.target.value)})}>
            {members?.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      )}
    </>
  )
}

export default function ScheduleTab({ trip, onUpdate }) {
  const dates = getDates(trip.startDate, trip.endDate)
  const [section, setSection] = useState('timeline')
  const [activeDate, setActiveDate] = useState(dates[0]?.key||'')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({...EMPTY_FORM, paidBy:trip.members[0]?.id||null})
  const [transportForm, setTransportForm] = useState(TRANSPORT_EMPTY)
  const [stayForm, setStayForm] = useState(STAY_EMPTY)
  const f = patch=>setForm(prev=>({...prev,...patch}))

  const filtered = (trip.schedules||[]).filter(s=>s.date?.split('T')[0]===activeDate).sort((a,b)=>(a.time||'').localeCompare(b.time||''))
  const dayTransports = (trip.transports||[]).filter(t=>t.date===activeDate)
  const dayStays = (trip.stays||[]).filter(s=>s.checkIn&&s.checkOut&&s.checkIn<=activeDate&&s.checkOut>=activeDate)

  function addSchedule() {
    if (!form.title) return
    const cat = CATEGORIES.find(c=>c.key===form.category)||CATEGORIES[0]
    const newExpenses = [...(trip.expenses||[])]
    if (form.cost && cat.hasCost) {
      const tt = TRANSPORT_TYPES.find(t=>t.key===form.transportType)
      const title = cat.key==='transport'
        ? `${tt?.icon} ${form.transportFrom||''}${form.transportTo?'→'+form.transportTo:''} (${form.title})`
        : `${cat.icon} ${form.title}${form.place?' · '+form.place:''}`
      newExpenses.push({
        id: Date.now()+1,
        category: cat.key==='snack'?'food':cat.key==='sightseeing'?'activity':cat.key,
        title, amount:Number(form.cost),
        currency:form.currency,
        exchangeRate:form.currency==='KRW'?1:(Number(form.exchangeRate)||1),
        paidBy:form.paidBy||trip.members[0]?.id,
        date:activeDate, fromSchedule:true,
      })
    }
    onUpdate({...trip, schedules:[...(trip.schedules||[]),{id:Date.now(),date:activeDate,...form}], expenses:newExpenses})
    setForm({...EMPTY_FORM, paidBy:trip.members[0]?.id||null})
    setShowModal(false)
  }

  function addTransport() {
    if (!transportForm.from||!transportForm.to) return
    onUpdate({...trip, transports:[...(trip.transports||[]),{id:Date.now(),date:activeDate,...transportForm}]})
    setTransportForm(TRANSPORT_EMPTY)
    setShowModal(false)
  }

  function addStay() {
    if (!stayForm.name) return
    onUpdate({...trip, stays:[...(trip.stays||[]),{id:Date.now(),...stayForm}]})
    setStayForm(STAY_EMPTY)
    setShowModal(false)
  }

  if (dates.length===0) {
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
      {/* 섹션 탭 (맨 위) */}
      <div style={{display:'flex',background:'var(--white)',borderBottom:'1px solid var(--gray-200)',flexShrink:0}}>
        {SECTION_TABS.map(s=>(
          <button key={s.key} onClick={()=>setSection(s.key)}
            style={{flex:1,padding:'9px 4px',fontSize:12,fontWeight:500,
              color:section===s.key?'var(--purple)':'var(--gray-400)',
              background:section===s.key?'var(--purple-light)':'transparent',
              borderBottom:section===s.key?'2px solid var(--purple)':'2px solid transparent',
              display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <span style={{fontSize:16}}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* 날짜 탭 (섹션 아래) */}
      <div style={{display:'flex',background:'var(--gray-50)',borderBottom:'1px solid var(--gray-200)',overflowX:'auto',flexShrink:0}}>
        {dates.map(d=>(
          <button key={d.key} onClick={()=>setActiveDate(d.key)}
            style={{flex:'0 0 auto',padding:'8px 12px',fontSize:11,fontWeight:500,
              color:activeDate===d.key?'var(--purple)':'var(--gray-400)',
              borderBottom:activeDate===d.key?'2px solid var(--purple)':'2px solid transparent',
              background:'none',whiteSpace:'nowrap'}}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="screen" style={{background:'var(--white)'}}>

        {/* ── 일정 타임라인 ── */}
        {section==='timeline' && (
          <>
            {filtered.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>이 날 일정이 없어요<br/><span style={{fontSize:12}}>아래 버튼으로 추가해보세요</span></div>}
            {filtered.map((item,idx)=>{
              const ic=CATEGORIES.find(c=>c.key===item.category)||CATEGORIES[7]
              const krw=toKRW(item.cost,item.currency,item.exchangeRate)
              const payer=trip.members?.find(m=>m.id===item.paidBy)
              const tt=TRANSPORT_TYPES.find(t=>t.key===item.transportType)
              const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0]
              return (
                <div key={item.id} style={{display:'flex',gap:10,marginBottom:4}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:12,paddingTop:18}}>
                    <div style={{width:9,height:9,borderRadius:'50%',background:ic.color,flexShrink:0}}/>
                    {idx<filtered.length-1&&<div style={{width:1,flex:1,background:'var(--gray-200)',margin:'3px auto 0'}}/>}
                  </div>
                  <div style={{flex:1,paddingBottom:16}}>
                    <div style={{fontSize:11,color:'var(--gray-400)',marginBottom:3}}>{item.time||'시간 미정'}</div>
                    <div className="card" style={{marginBottom:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <span style={{fontSize:14,fontWeight:600}}>{item.title}</span>
                        <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:ic.bg,color:ic.color,fontWeight:500,whiteSpace:'nowrap',marginLeft:8}}>{ic.icon} {ic.label}</span>
                      </div>
                      {item.category==='transport'&&(item.transportFrom||item.transportTo)&&(
                        <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--purple-light)',borderRadius:8,padding:'6px 10px',marginBottom:6,fontSize:12}}>
                          <span>{tt?.icon||'✈️'}</span>
                          <span style={{color:'var(--purple-dark)',fontWeight:500}}>{[item.transportFrom,item.transportTo].filter(Boolean).join(' → ')}</span>
                        </div>
                      )}
                      {item.place&&(
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6,flexWrap:'wrap'}}>
                          <span style={{fontSize:12,color:'var(--gray-600)'}}>📍 {item.place}</span>
                          <MapBtn name={item.place} mapQuery={item.mapQuery}/>
                        </div>
                      )}
                      {!item.place&&item.mapQuery&&<div style={{marginBottom:6}}><MapBtn name={item.title} mapQuery={item.mapQuery}/></div>}
                      {Number(item.cost)>0&&(
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6,paddingTop:6,borderTop:'1px solid var(--gray-100)'}}>
                          <span style={{fontSize:11,color:'var(--gray-400)'}}>결제: {payer?.name||'미지정'}</span>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:13,fontWeight:700,color:'var(--purple)'}}>{cur.flag} {cur.symbol}{Number(item.cost).toLocaleString()}</div>
                            {item.currency!=='KRW'&&<div style={{fontSize:10,color:'var(--gray-400)'}}>≈ ₩{krw.toLocaleString()}</div>}
                          </div>
                        </div>
                      )}
                      {item.note&&<div style={{fontSize:11,color:'var(--gray-600)',marginTop:4}}>{item.note}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
            <button onClick={()=>{setShowModal(true)}} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>일정 추가
            </button>
          </>
        )}

        {/* ── 교통편 ── */}
        {section==='transport'&&(
          <>
            {dayTransports.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>이 날 교통편이 없어요</div>}
            {dayTransports.map(t=>{
              const tt=TRANSPORT_TYPES.find(x=>x.key===t.type)||TRANSPORT_TYPES[0]
              return (
                <div key={t.id} className="card">
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'var(--purple-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{tt.icon}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{tt.label}</div>
                      {t.code&&<div style={{fontSize:11,color:'var(--gray-400)'}}>편명: {t.code}</div>}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--gray-50)',borderRadius:8,padding:'10px'}}>
                    <div style={{textAlign:'center',flex:1}}>
                      <div style={{fontSize:15,fontWeight:700}}>{t.from}</div>
                      {t.departTime&&<div style={{fontSize:11,color:'var(--gray-400)'}}>{t.departTime}</div>}
                    </div>
                    <div style={{color:'var(--purple)',fontSize:18}}>→</div>
                    <div style={{textAlign:'center',flex:1}}>
                      <div style={{fontSize:15,fontWeight:700}}>{t.to}</div>
                      {t.arriveTime&&<div style={{fontSize:11,color:'var(--gray-400)'}}>{t.arriveTime}</div>}
                    </div>
                  </div>
                  {t.note&&<div style={{fontSize:11,color:'var(--gray-600)',marginTop:8}}>{t.note}</div>}
                </div>
              )
            })}
            <button onClick={()=>setShowModal(true)} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>교통편 추가
            </button>
          </>
        )}

        {/* ── 숙소 ── */}
        {section==='stay'&&(
          <>
            {dayStays.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>이 날 숙소 정보가 없어요</div>}
            {dayStays.map(s=>(
              <div key={s.id} className="card">
                <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🏨</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600}}>{s.name}</div>
                    {s.address&&<button onClick={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(s.name+' '+s.address)}`,'_blank')} style={{fontSize:11,color:'var(--purple)',background:'none',border:'none',padding:0,cursor:'pointer',display:'flex',alignItems:'center',gap:3,marginTop:2}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {s.address} · 지도 보기
                    </button>}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {s.checkIn&&<div style={{flex:1,background:'var(--gray-50)',borderRadius:8,padding:'8px 10px'}}><div style={{fontSize:10,color:'var(--gray-400)',marginBottom:2}}>체크인</div><div style={{fontSize:13,fontWeight:500}}>{s.checkIn}</div></div>}
                  {s.checkOut&&<div style={{flex:1,background:'var(--gray-50)',borderRadius:8,padding:'8px 10px'}}><div style={{fontSize:10,color:'var(--gray-400)',marginBottom:2}}>체크아웃</div><div style={{fontSize:13,fontWeight:500}}>{s.checkOut}</div></div>}
                </div>
                {s.confirmNo&&<div style={{marginTop:8,padding:'7px 10px',background:'var(--purple-light)',borderRadius:8,fontSize:12,color:'var(--purple)'}}>예약번호: <strong>{s.confirmNo}</strong></div>}
                {s.note&&<div style={{fontSize:11,color:'var(--gray-600)',marginTop:8}}>{s.note}</div>}
              </div>
            ))}
            <button onClick={()=>setShowModal(true)} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>숙소 추가
            </button>
          </>
        )}
      </div>

      {/* 모달 */}
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:'90vh',overflowY:'auto'}}>

            {/* 일정 모달 */}
            {section==='timeline'&&(
              <>
                <div className="modal-title">일정 추가 — {dates.find(d=>d.key===activeDate)?.label}</div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{width:88,flexShrink:0}}>
                    <label className="form-label">시간</label>
                    <input className="form-input" type="time" value={form.time} onChange={e=>f({time:e.target.value})} />
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label className="form-label">제목 *</label>
                    <input className="form-input" placeholder="예: 이치란 라멘" value={form.title} onChange={e=>f({title:e.target.value})} />
                  </div>
                </div>

                {/* 카테고리 선택 */}
                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {CATEGORIES.map(c=>(
                      <button key={c.key} onClick={()=>f({category:c.key,cost:'',currency:'KRW',exchangeRate:'',place:'',mapQuery:'',transportFrom:'',transportTo:'',transportType:'subway'})}
                        style={{padding:'6px 11px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',
                          background:form.category===c.key?c.color:'var(--gray-100)',
                          color:form.category===c.key?'#fff':'var(--gray-600)'}}>
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 카테고리별 자동 입력란 */}
                <CategoryFields form={form} f={f} members={trip.members} />

                <div className="form-group">
                  <label className="form-label">메모</label>
                  <input className="form-input" placeholder="추가 메모" value={form.note} onChange={e=>f({note:e.target.value})} />
                </div>
                <button className="btn-primary" onClick={addSchedule} style={{opacity:form.title?1:.5}}>추가하기</button>
              </>
            )}

            {/* 교통편 모달 */}
            {section==='transport'&&(
              <>
                <div className="modal-title">✈️ 교통편 추가 — {dates.find(d=>d.key===activeDate)?.label}</div>
                <div className="form-group">
                  <label className="form-label">교통 수단</label>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {TRANSPORT_TYPES.map(t=>(
                      <button key={t.key} onClick={()=>setTransportForm(p=>({...p,type:t.key}))}
                        style={{padding:'5px 10px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',
                          background:transportForm.type===t.key?'var(--purple)':'var(--gray-100)',
                          color:transportForm.type===t.key?'#fff':'var(--gray-600)'}}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{flex:1}}><label className="form-label">출발지 *</label><input className="form-input" placeholder="예: 인천공항" value={transportForm.from} onChange={e=>setTransportForm(p=>({...p,from:e.target.value}))}/></div>
                  <div className="form-group" style={{flex:1}}><label className="form-label">도착지 *</label><input className="form-input" placeholder="예: 간사이공항" value={transportForm.to} onChange={e=>setTransportForm(p=>({...p,to:e.target.value}))}/></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{flex:1}}><label className="form-label">출발 시간</label><input className="form-input" type="time" value={transportForm.departTime} onChange={e=>setTransportForm(p=>({...p,departTime:e.target.value}))}/></div>
                  <div className="form-group" style={{flex:1}}><label className="form-label">도착 시간</label><input className="form-input" type="time" value={transportForm.arriveTime} onChange={e=>setTransportForm(p=>({...p,arriveTime:e.target.value}))}/></div>
                </div>
                <div className="form-group"><label className="form-label">편명 / 예약번호</label><input className="form-input" placeholder="예: OZ111" value={transportForm.code} onChange={e=>setTransportForm(p=>({...p,code:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">메모</label><input className="form-input" placeholder="게이트, 좌석 등" value={transportForm.note} onChange={e=>setTransportForm(p=>({...p,note:e.target.value}))}/></div>
                <button className="btn-primary" onClick={addTransport}>추가하기</button>
              </>
            )}

            {/* 숙소 모달 */}
            {section==='stay'&&(
              <>
                <div className="modal-title">🏨 숙소 추가</div>
                <div className="form-group"><label className="form-label">숙소 이름 *</label><input className="form-input" placeholder="예: 도톤보리 게스트하우스" value={stayForm.name} onChange={e=>setStayForm(p=>({...p,name:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">주소</label><input className="form-input" placeholder="예: 오사카 주오구 도톤보리" value={stayForm.address} onChange={e=>setStayForm(p=>({...p,address:e.target.value}))}/></div>
                <div style={{display:'flex',gap:8}}>
                  <div className="form-group" style={{flex:1}}><label className="form-label">체크인</label><input className="form-input" type="date" value={stayForm.checkIn} onChange={e=>setStayForm(p=>({...p,checkIn:e.target.value}))}/></div>
                  <div className="form-group" style={{flex:1}}><label className="form-label">체크아웃</label><input className="form-input" type="date" value={stayForm.checkOut} onChange={e=>setStayForm(p=>({...p,checkOut:e.target.value}))}/></div>
                </div>
                <div className="form-group"><label className="form-label">예약 확인번호</label><input className="form-input" placeholder="예: ABCD1234" value={stayForm.confirmNo} onChange={e=>setStayForm(p=>({...p,confirmNo:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">메모</label><input className="form-input" placeholder="체크인 시간, 조식 여부 등" value={stayForm.note} onChange={e=>setStayForm(p=>({...p,note:e.target.value}))}/></div>
                <button className="btn-primary" onClick={addStay}>추가하기</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
