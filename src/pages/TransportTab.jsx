import React, { useState } from 'react'
import EditDeleteMenu from '../components/EditDeleteMenu'

const TRANSPORT_TYPES = [
  { key:'flight', label:'항공',   icon:'✈️' },{ key:'train',  label:'기차',   icon:'🚄' },
  { key:'bus',    label:'버스',   icon:'🚌' },{ key:'car',    label:'자동차', icon:'🚗' },
  { key:'ferry',  label:'페리',   icon:'⛴️' },{ key:'subway', label:'지하철', icon:'🚇' },
  { key:'taxi',   label:'택시',   icon:'🚕' },{ key:'walk',   label:'도보',   icon:'🚶' },
]

const EMPTY = { type:'flight', from:'', to:'', departTime:'', arriveTime:'', code:'', note:'' }

export default function TransportTab({ trip, onUpdate, activeDate, dates }) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const f = p => setForm(prev=>({...prev,...p}))

  const items = (trip.transports||[]).filter(t=>t.date===activeDate)

  function openAdd() { setEditingId(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(item) { setEditingId(item.id); setForm({type:item.type,from:item.from||'',to:item.to||'',departTime:item.departTime||'',arriveTime:item.arriveTime||'',code:item.code||'',note:item.note||''}); setShowModal(true) }
  function deleteItem(id) { onUpdate({...trip, transports:(trip.transports||[]).filter(t=>t.id!==id)}) }
  function save() {
    if (!form.from||!form.to) return
    const item = { id:editingId||Date.now(), date:activeDate, ...form }
    const transports = editingId
      ? (trip.transports||[]).map(t=>t.id===editingId?item:t)
      : [...(trip.transports||[]), item]
    onUpdate({...trip, transports})
    setEditingId(null); setShowModal(false)
  }

  if (dates.length===0) return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--gray-400)',fontSize:13}}>여행 날짜를 설정해주세요</div>

  return (
    <div style={{flex:1,overflow:'auto',background:'var(--white)',padding:'12px 16px'}}>
      {items.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>이 날 교통편이 없어요</div>}
      {items.map(item=>{
        const tt=TRANSPORT_TYPES.find(t=>t.key===item.type)||TRANSPORT_TYPES[0]
        return (
          <div key={item.id} className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:'var(--purple-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{tt.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{tt.label}</div>
                {item.code&&<div style={{fontSize:11,color:'var(--gray-400)'}}>편명: {item.code}</div>}
              </div>
              <EditDeleteMenu onEdit={()=>openEdit(item)} onDelete={()=>deleteItem(item.id)}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--gray-50)',borderRadius:8,padding:'10px'}}>
              <div style={{textAlign:'center',flex:1}}>
                <div style={{fontSize:15,fontWeight:700}}>{item.from}</div>
                {item.departTime&&<div style={{fontSize:11,color:'var(--gray-400)'}}>{item.departTime}</div>}
              </div>
              <div style={{color:'var(--purple)',fontSize:18}}>→</div>
              <div style={{textAlign:'center',flex:1}}>
                <div style={{fontSize:15,fontWeight:700}}>{item.to}</div>
                {item.arriveTime&&<div style={{fontSize:11,color:'var(--gray-400)'}}>{item.arriveTime}</div>}
              </div>
            </div>
            {item.note&&<div style={{fontSize:11,color:'var(--gray-600)',marginTop:8}}>{item.note}</div>}
          </div>
        )
      })}
      <button onClick={openAdd} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4,cursor:'pointer'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>교통편 추가
      </button>

      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{editingId?'교통편 수정':'교통편 추가'} — {dates.find(d=>d.key===activeDate)?.label}</div>
            <div className="form-group">
              <label className="form-label">교통 수단</label>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {TRANSPORT_TYPES.map(t=><button key={t.key} onClick={()=>f({type:t.key})} style={{padding:'5px 10px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',cursor:'pointer',background:form.type===t.key?'var(--purple)':'var(--gray-100)',color:form.type===t.key?'#fff':'var(--gray-600)'}}>{t.icon} {t.label}</button>)}
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <div className="form-group" style={{flex:1}}><label className="form-label">출발지 *</label><input className="form-input" placeholder="예: 인천공항" value={form.from} onChange={e=>f({from:e.target.value})}/></div>
              <div className="form-group" style={{flex:1}}><label className="form-label">도착지 *</label><input className="form-input" placeholder="예: 후쿠오카공항" value={form.to} onChange={e=>f({to:e.target.value})}/></div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <div className="form-group" style={{flex:1}}><label className="form-label">출발 시간</label><input className="form-input" type="time" value={form.departTime} onChange={e=>f({departTime:e.target.value})}/></div>
              <div className="form-group" style={{flex:1}}><label className="form-label">도착 시간</label><input className="form-input" type="time" value={form.arriveTime} onChange={e=>f({arriveTime:e.target.value})}/></div>
            </div>
            <div className="form-group"><label className="form-label">편명 / 예약번호</label><input className="form-input" placeholder="예: OZ111" value={form.code} onChange={e=>f({code:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">메모</label><input className="form-input" placeholder="게이트, 좌석 등" value={form.note} onChange={e=>f({note:e.target.value})}/></div>
            <button className="btn-primary" onClick={save}>{editingId?'수정 완료':'추가하기'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
