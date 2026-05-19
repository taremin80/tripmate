import React, { useState } from 'react'
import EditDeleteMenu from '../components/EditDeleteMenu'

const EMPTY = { name:'', checkIn:'', checkOut:'', confirmNo:'', address:'', note:'' }

export default function StayTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const f = p => setForm(prev=>({...prev,...p}))

  function openAdd() { setEditingId(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(item) { setEditingId(item.id); setForm({name:item.name,checkIn:item.checkIn||'',checkOut:item.checkOut||'',confirmNo:item.confirmNo||'',address:item.address||'',note:item.note||''}); setShowModal(true) }
  function deleteItem(id) { onUpdate({...trip, stays:(trip.stays||[]).filter(s=>s.id!==id)}) }
  function save() {
    if (!form.name) return
    const item = { id:editingId||Date.now(), ...form }
    const stays = editingId
      ? (trip.stays||[]).map(s=>s.id===editingId?item:s)
      : [...(trip.stays||[]), item]
    onUpdate({...trip, stays})
    setEditingId(null); setShowModal(false)
  }

  const items = trip.stays||[]

  return (
    <div style={{flex:1,overflow:'auto',background:'var(--white)',padding:'12px 16px'}}>
      {items.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'30px 0',fontSize:13}}>등록된 숙소가 없어요</div>}
      {items.map(item=>(
        <div key={item.id} className="card">
          <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:'var(--teal-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🏨</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600}}>{item.name}</div>
              {item.address&&(
                <button onClick={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(item.name+' '+item.address)}`,'_blank')}
                  style={{fontSize:11,color:'var(--purple)',background:'none',border:'none',padding:0,cursor:'pointer',display:'flex',alignItems:'center',gap:3,marginTop:2}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {item.address} · 지도 보기
                </button>
              )}
            </div>
            <EditDeleteMenu onEdit={()=>openEdit(item)} onDelete={()=>deleteItem(item.id)}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            {item.checkIn&&<div style={{flex:1,background:'var(--gray-50)',borderRadius:8,padding:'8px 10px'}}><div style={{fontSize:10,color:'var(--gray-400)',marginBottom:2}}>체크인</div><div style={{fontSize:13,fontWeight:500}}>{item.checkIn}</div></div>}
            {item.checkOut&&<div style={{flex:1,background:'var(--gray-50)',borderRadius:8,padding:'8px 10px'}}><div style={{fontSize:10,color:'var(--gray-400)',marginBottom:2}}>체크아웃</div><div style={{fontSize:13,fontWeight:500}}>{item.checkOut}</div></div>}
          </div>
          {item.confirmNo&&<div style={{marginTop:8,padding:'7px 10px',background:'var(--purple-light)',borderRadius:8,fontSize:12,color:'var(--purple)'}}>예약번호: <strong>{item.confirmNo}</strong></div>}
          {item.note&&<div style={{fontSize:11,color:'var(--gray-600)',marginTop:8}}>{item.note}</div>}
        </div>
      ))}
      <button onClick={openAdd} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4,cursor:'pointer'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>숙소 추가
      </button>

      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{editingId?'숙소 수정':'숙소 추가'}</div>
            <div className="form-group"><label className="form-label">숙소 이름 *</label><input className="form-input" placeholder="예: 호텔 닛코 후쿠오카" value={form.name} onChange={e=>f({name:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">주소 (지도 연결용)</label><input className="form-input" placeholder="예: 후쿠오카 하카타구" value={form.address} onChange={e=>f({address:e.target.value})}/></div>
            <div style={{display:'flex',gap:8}}>
              <div className="form-group" style={{flex:1}}><label className="form-label">체크인</label><input className="form-input" type="date" value={form.checkIn} onChange={e=>f({checkIn:e.target.value})}/></div>
              <div className="form-group" style={{flex:1}}><label className="form-label">체크아웃</label><input className="form-input" type="date" value={form.checkOut} onChange={e=>f({checkOut:e.target.value})}/></div>
            </div>
            <div className="form-group"><label className="form-label">예약 확인번호</label><input className="form-input" placeholder="예: ABCD1234" value={form.confirmNo} onChange={e=>f({confirmNo:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">메모</label><input className="form-input" placeholder="체크인 시간, 조식 여부 등" value={form.note} onChange={e=>f({note:e.target.value})}/></div>
            <button className="btn-primary" onClick={save}>{editingId?'수정 완료':'추가하기'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
