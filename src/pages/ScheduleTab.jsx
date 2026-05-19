import React, { useState } from 'react'
import EditDeleteMenu from '../components/EditDeleteMenu'

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
  { key:'flight', label:'항공',   icon:'✈️' },{ key:'train',  label:'기차',   icon:'🚄' },
  { key:'bus',    label:'버스',   icon:'🚌' },{ key:'car',    label:'자동차', icon:'🚗' },
  { key:'ferry',  label:'페리',   icon:'⛴️' },{ key:'subway', label:'지하철', icon:'🚇' },
  { key:'taxi',   label:'택시',   icon:'🚕' },{ key:'walk',   label:'도보',   icon:'🚶' },
]

const CURRENCIES = [
  { code:'KRW', symbol:'₩', flag:'🇰🇷' },{ code:'JPY', symbol:'¥', flag:'🇯🇵' },
  { code:'USD', symbol:'$', flag:'🇺🇸' },{ code:'EUR', symbol:'€', flag:'🇪🇺' },
  { code:'THB', symbol:'฿', flag:'🇹🇭' },
]

const EMPTY = { time:'', category:'food', place:'', mapQuery:'', note:'', transport:'none', transportFrom:'', transportTo:'', cost:'', currency:'KRW', krwAmount:'', paidBy:null }

function toKRW(amount, currency, rate) {
  if (!currency||currency==='KRW') return Number(amount)||0
  return Math.round((Number(amount)||0)*(Number(rate)||1))
}

function MapBtn({ name, mapQuery }) {
  const q = mapQuery||name||''
  if (!q) return null
  return (
    <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(q)}`,'_blank')}
      style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',background:'#4285F4',color:'#fff',borderRadius:6,fontSize:11,fontWeight:500,border:'none',cursor:'pointer'}}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      구글 지도
    </button>
  )
}

export default function ScheduleTab({ trip, onUpdate, activeDate, dates }) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({...EMPTY, paidBy:trip.members[0]?.id||null})
  const f = p => setForm(prev=>({...prev,...p}))

  const filtered = (trip.schedules||[]).filter(s=>s.date?.split('T')[0]===activeDate).sort((a,b)=>(a.time||'').localeCompare(b.time||''))
  const cat = CATEGORIES.find(c=>c.key===form.category)||CATEGORIES[0]
  const hasTransport = form.transport && form.transport!=='none'
  const needsKRW = form.currency!=='KRW'

  function openAdd() { setEditingId(null); setForm({...EMPTY,paidBy:trip.members[0]?.id||null}); setShowModal(true) }
  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      time:item.time||'', category:item.category||'food',
      place:item.place||'', mapQuery:item.mapQuery||'', note:item.note||'',
      transport:item.transport||'none', transportFrom:item.transportFrom||'', transportTo:item.transportTo||'',
      cost:item.cost||'', currency:item.currency||'KRW',
      krwAmount:item.currency!=='KRW'&&item.krwAmount ? item.krwAmount : '',
      paidBy:item.paidBy||trip.members[0]?.id||null,
    })
    setShowModal(true)
  }
  function deleteItem(id) { onUpdate({...trip,schedules:(trip.schedules||[]).filter(s=>s.id!==id)}) }

  function save() {
    if (!form.category) return
    const catObj = CATEGORIES.find(c=>c.key===form.category)||CATEGORIES[0]
    const newExpenses = [...(trip.expenses||[])]

    if (!editingId && form.cost && catObj.hasCost) {
      const tt = TRANSPORT_TYPES.find(t=>t.key===form.transport)
      const label = form.place||form.note||catObj.label
      const expTitle = form.category==='transport'
        ? `${tt?.icon||''} ${form.transportFrom||''}${form.transportTo?'→'+form.transportTo:''}`
        : `${catObj.icon} ${label}`
      const finalKRW = needsKRW && form.krwAmount ? Number(form.krwAmount) : Number(form.cost)
      newExpenses.push({
        id:Date.now()+1,
        category:form.category==='snack'?'food':form.category==='sightseeing'?'activity':form.category,
        title:expTitle.trim(), amount:finalKRW, currency:'KRW', exchangeRate:1,
        originalAmount:Number(form.cost), originalCurrency:form.currency,
        paidBy:form.paidBy||trip.members[0]?.id,
        date:activeDate, fromSchedule:true,
      })
    }

    const newItem = { id:editingId||Date.now(), date:activeDate, ...form }
    const schedules = editingId
      ? (trip.schedules||[]).map(s=>s.id===editingId?newItem:s)
      : [...(trip.schedules||[]), newItem]
    onUpdate({...trip, schedules, expenses:newExpenses})
    setEditingId(null)
    setShowModal(false)
  }

  if (dates.length===0) {
    return (
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,color:'var(--gray-400)',padding:'20px',textAlign:'center'}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <div style={{fontSize:14}}>여행 날짜를 설정해주세요</div>
        <div style={{fontSize:12}}>설정에서 날짜를 입력하면 일정을 추가할 수 있어요</div>
      </div>
    )
  }

  return (
    <div style={{flex:1,overflow:'auto',background:'var(--white)',padding:'12px 16px'}}>
      {filtered.length===0&&(
        <div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>
          이 날 일정이 없어요<br/><span style={{fontSize:12}}>아래 버튼으로 추가해보세요</span>
        </div>
      )}
      {filtered.map((item,idx)=>{
        const ic=CATEGORIES.find(c=>c.key===item.category)||CATEGORIES[7]
        const tt=TRANSPORT_TYPES.find(t=>t.key===item.transport)
        const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0]
        const krw=toKRW(item.cost,item.currency,item.krwAmount?item.krwAmount/item.cost:1)
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
                  <span style={{fontSize:14,fontWeight:600}}>{item.place||ic.label}</span>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:ic.bg,color:ic.color,fontWeight:500,whiteSpace:'nowrap'}}>{ic.icon} {ic.label}</span>
                    <EditDeleteMenu onEdit={()=>openEdit(item)} onDelete={()=>deleteItem(item.id)}/>
                  </div>
                </div>
                {item.category==='transport'&&(item.transportFrom||item.transportTo)&&(
                  <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--purple-light)',borderRadius:8,padding:'6px 10px',marginBottom:6,fontSize:12}}>
                    <span>{tt?.icon||'✈️'}</span>
                    <span style={{color:'var(--purple-dark)',fontWeight:500}}>{[item.transportFrom,item.transportTo].filter(Boolean).join(' → ')}</span>
                  </div>
                )}
                {(item.place||item.mapQuery)&&(
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6,flexWrap:'wrap'}}>
                    {item.place&&<span style={{fontSize:12,color:'var(--gray-600)'}}>📍 {item.place}</span>}
                    <MapBtn name={item.place||item.note} mapQuery={item.mapQuery}/>
                  </div>
                )}
                {Number(item.cost)>0&&(
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6,paddingTop:6,borderTop:'1px solid var(--gray-100)'}}>
                    <span style={{fontSize:11,color:'var(--gray-400)'}}>결제: {trip.members?.find(m=>m.id===item.paidBy)?.name||'미지정'}</span>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'var(--purple)'}}>
                        {item.currency!=='KRW'?`${cur.flag} ${cur.symbol}${Number(item.cost).toLocaleString()}`:`₩${Number(item.cost).toLocaleString()}`}
                      </div>
                      {item.currency!=='KRW'&&item.krwAmount&&<div style={{fontSize:10,color:'var(--gray-400)'}}>₩{Number(item.krwAmount).toLocaleString()}</div>}
                    </div>
                  </div>
                )}
                {item.note&&<div style={{fontSize:11,color:'var(--gray-600)',marginTop:4}}>{item.note}</div>}
              </div>
            </div>
          </div>
        )
      })}
      <button onClick={openAdd} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4,cursor:'pointer'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>일정 추가
      </button>

      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:'90vh',overflowY:'auto'}}>
            <div className="modal-title">{editingId?'일정 수정':'일정 추가'} — {dates.find(d=>d.key===activeDate)?.label}</div>
            <div className="form-group" style={{maxWidth:130}}>
              <label className="form-label">시간</label>
              <input className="form-input" type="time" value={form.time} onChange={e=>f({time:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {CATEGORIES.map(c=>(
                  <button key={c.key} onClick={()=>f({category:c.key,cost:'',currency:'KRW',krwAmount:'',place:'',mapQuery:'',transportFrom:'',transportTo:'',transport:'none'})}
                    style={{padding:'6px 11px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',cursor:'pointer',
                      background:form.category===c.key?c.color:'var(--gray-100)',
                      color:form.category===c.key?'#fff':'var(--gray-600)'}}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {cat.hasRoute&&(
              <div style={{background:'var(--purple-light)',borderRadius:10,padding:'12px',marginBottom:14}}>
                <label className="form-label" style={{color:'var(--purple)'}}>교통 수단</label>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
                  {TRANSPORT_TYPES.map(t=>(
                    <button key={t.key} onClick={()=>f({transport:t.key})}
                      style={{padding:'5px 9px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',cursor:'pointer',
                        background:form.transport===t.key?'var(--purple)':'rgba(255,255,255,.7)',
                        color:form.transport===t.key?'#fff':'var(--gray-600)'}}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <div style={{flex:1}}><label className="form-label">출발지</label><input className="form-input" placeholder="예: 인천공항" value={form.transportFrom} onChange={e=>f({transportFrom:e.target.value})}/></div>
                  <div style={{flex:1}}><label className="form-label">도착지</label><input className="form-input" placeholder="예: 후쿠오카공항" value={form.transportTo} onChange={e=>f({transportTo:e.target.value})}/></div>
                </div>
                <label className="form-label">교통비</label>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                  {CURRENCIES.map(c=><button key={c.code} onClick={()=>f({currency:c.code,krwAmount:''})} style={{padding:'4px 8px',borderRadius:16,fontSize:11,border:'none',cursor:'pointer',background:form.currency===c.code?'var(--purple)':'rgba(255,255,255,.6)',color:form.currency===c.code?'#fff':'var(--gray-600)',fontWeight:500}}>{c.flag} {c.code}</button>)}
                </div>
                <div style={{display:'flex'}}>
                  <span style={{padding:'10px',background:'rgba(255,255,255,.7)',borderRadius:'8px 0 0 8px',fontSize:13,fontWeight:700,color:'var(--purple)',border:'1px solid rgba(91,79,207,.2)',borderRight:'none'}}>{CURRENCIES.find(c=>c.code===form.currency)?.symbol||'₩'}</span>
                  <input className="form-input" type="number" placeholder="0" style={{borderRadius:'0 8px 8px 0'}} value={form.cost} onChange={e=>f({cost:e.target.value})}/>
                </div>
                {needsKRW&&form.cost&&(
                  <div style={{marginTop:8}}>
                    <label className="form-label">₩ 원화 금액</label>
                    <div style={{display:'flex'}}>
                      <span style={{padding:'10px',background:'rgba(255,255,255,.7)',borderRadius:'8px 0 0 8px',fontSize:13,fontWeight:700,color:'var(--purple)',border:'1px solid rgba(91,79,207,.2)',borderRight:'none'}}>₩</span>
                      <input className="form-input" type="number" placeholder="예: 553400" style={{borderRadius:'0 8px 8px 0'}} value={form.krwAmount} onChange={e=>f({krwAmount:e.target.value})}/>
                    </div>
                  </div>
                )}
              </div>
            )}

            {cat.hasPlace&&(
              <div className="form-group">
                <label className="form-label">{cat.key==='food'||cat.key==='snack'?'식당 이름':cat.key==='hotel'?'숙소 이름':cat.key==='shopping'?'쇼핑 장소':'장소 이름'}</label>
                <input className="form-input" placeholder={cat.key==='food'?'예: 이치란 도톤보리점':cat.key==='hotel'?'예: 호텔 닛코 후쿠오카':'예: 오사카성'} value={form.place} onChange={e=>f({place:e.target.value})}/>
              </div>
            )}
            {cat.hasPlace&&(
              <div className="form-group">
                <label className="form-label">구글 지도 검색어 (비워두면 장소명으로 검색)</label>
                <input className="form-input" placeholder="예: Ichiran Ramen Dotonbori" value={form.mapQuery} onChange={e=>f({mapQuery:e.target.value})}/>
              </div>
            )}

            {cat.hasCost&&!cat.hasRoute&&(
              <div style={{background:'var(--gray-50)',borderRadius:10,padding:'12px',marginBottom:14}}>
                <label className="form-label">{cat.key==='food'||cat.key==='snack'?'식사 금액':cat.key==='sightseeing'||cat.key==='activity'?'입장료 / 비용':cat.key==='shopping'?'쇼핑 금액':'금액'}</label>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                  {CURRENCIES.map(c=><button key={c.code} onClick={()=>f({currency:c.code,krwAmount:''})} style={{padding:'4px 8px',borderRadius:16,fontSize:11,border:'none',cursor:'pointer',background:form.currency===c.code?'var(--purple)':'var(--white)',color:form.currency===c.code?'#fff':'var(--gray-600)',fontWeight:500}}>{c.flag} {c.code}</button>)}
                </div>
                <div style={{display:'flex'}}>
                  <span style={{padding:'10px',background:'var(--gray-100)',borderRadius:'8px 0 0 8px',fontSize:13,fontWeight:700,color:'var(--gray-600)',border:'1px solid var(--gray-200)',borderRight:'none'}}>{CURRENCIES.find(c=>c.code===form.currency)?.symbol||'₩'}</span>
                  <input className="form-input" type="number" placeholder="0" style={{borderRadius:'0 8px 8px 0'}} value={form.cost} onChange={e=>f({cost:e.target.value})}/>
                </div>
                {needsKRW&&form.cost&&(
                  <div style={{marginTop:8}}>
                    <label className="form-label">₩ 원화 금액</label>
                    <div style={{display:'flex'}}>
                      <span style={{padding:'10px',background:'var(--gray-100)',borderRadius:'8px 0 0 8px',fontSize:13,fontWeight:700,color:'var(--gray-600)',border:'1px solid var(--gray-200)',borderRight:'none'}}>₩</span>
                      <input className="form-input" type="number" placeholder="실제 결제 금액" style={{borderRadius:'0 8px 8px 0'}} value={form.krwAmount} onChange={e=>f({krwAmount:e.target.value})}/>
                    </div>
                    {form.cost&&form.krwAmount&&<div style={{fontSize:11,color:'var(--gray-400)',marginTop:4}}>적용 환율: 1{CURRENCIES.find(c=>c.code===form.currency)?.symbol} = ₩{(Number(form.krwAmount)/Number(form.cost)).toFixed(2)}</div>}
                  </div>
                )}
              </div>
            )}

            {cat.hasCost&&form.cost&&(
              <div className="form-group">
                <label className="form-label">결제한 사람</label>
                <select className="form-input" value={form.paidBy||''} onChange={e=>f({paidBy:parseInt(e.target.value)})}>
                  {trip.members?.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">메모</label>
              <input className="form-input" placeholder="추가 메모" value={form.note} onChange={e=>f({note:e.target.value})}/>
            </div>
            <button className="btn-primary" onClick={save}>{editingId?'수정 완료':'추가하기'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
