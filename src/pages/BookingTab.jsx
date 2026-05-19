import React, { useState } from 'react'
import EditDeleteMenu from '../components/EditDeleteMenu'

const STATUS = { confirmed:{label:'확정',cls:'badge-teal'}, pending:{label:'대기중',cls:'badge-amber'}, cancelled:{label:'취소',cls:'badge-red'} }
const CATEGORIES = [
  { key:'flight',   label:'항공',   icon:'✈️', color:'#5B4FCF', bg:'#EEEDFE' },
  { key:'hotel',    label:'숙소',   icon:'🏨', color:'#0F9B8E', bg:'#E0F5F3' },
  { key:'activity', label:'투어',   icon:'🎫', color:'#E07B39', bg:'#FEF3E8' },
  { key:'food',     label:'식당',   icon:'🍜', color:'#E07B39', bg:'#FEF3E8' },
  { key:'transport',label:'교통',   icon:'🚆', color:'#3A9E6F', bg:'#E5F5EE' },
]
const EMPTY = { category:'flight', title:'', detail:'', subDetail:'', status:'confirmed' }

export default function BookingTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const f = p => setForm(prev=>({...prev,...p}))

  const grouped = CATEGORIES.map(c=>({...c, items:trip.bookings.filter(b=>b.category===c.key)})).filter(g=>g.items.length>0)

  function openAdd() { setEditingId(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(item) {
    setEditingId(item.id)
    setForm({ category:item.category, title:item.title, detail:item.detail||'', subDetail:item.subDetail||'', status:item.status||'confirmed' })
    setShowModal(true)
  }
  function deleteBooking(id) { onUpdate({...trip, bookings:trip.bookings.filter(b=>b.id!==id)}) }
  function save() {
    if (!form.title) return
    const item = { id:editingId||Date.now(), ...form }
    const bookings = editingId
      ? trip.bookings.map(b=>b.id===editingId?item:b)
      : [...trip.bookings, item]
    onUpdate({...trip, bookings})
    setShowModal(false)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <h1>예약 내역</h1>
        <button onClick={openAdd} style={{color:'#fff',fontSize:13,display:'flex',alignItems:'center',gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>추가
        </button>
      </div>
      <div className="screen">
        {grouped.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>예약 내역이 없어요</div>}
        {grouped.map(g=>(
          <div key={g.key}>
            <div className="section-label">{g.icon} {g.label}</div>
            {g.items.map(item=>{
              const st=STATUS[item.status]||STATUS.confirmed
              return (
                <div key={item.id} className="card" style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <div style={{width:38,height:38,borderRadius:9,background:g.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{g.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2,alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:600}}>{item.title}</span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--gray-600)',marginBottom:1}}>{item.detail}</div>
                    <div style={{fontSize:11,color:'var(--gray-400)'}}>{item.subDetail}</div>
                  </div>
                  <EditDeleteMenu onEdit={()=>openEdit(item)} onDelete={()=>deleteBooking(item.id)}/>
                </div>
              )
            })}
          </div>
        ))}
        <button onClick={openAdd} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>예약 추가
        </button>
      </div>

      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{editingId?'예약 수정':'예약 추가'}</div>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select className="form-input" value={form.category} onChange={e=>f({category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">이름 *</label>
              <input className="form-input" placeholder="예: 아시아나 OZ111" value={form.title} onChange={e=>f({title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">날짜 / 상세</label>
              <input className="form-input" placeholder="예: 6/3 ICN→KIX 08:30" value={form.detail} onChange={e=>f({detail:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">예약번호 / 메모</label>
              <input className="form-input" placeholder="예: 예약번호 ABCD12" value={form.subDetail} onChange={e=>f({subDetail:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">상태</label>
              <select className="form-input" value={form.status} onChange={e=>f({status:e.target.value})}>
                <option value="confirmed">✅ 확정</option>
                <option value="pending">⏳ 대기중</option>
                <option value="cancelled">❌ 취소</option>
              </select>
            </div>
            <button className="btn-primary" onClick={save}>{editingId?'수정 완료':'추가하기'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
