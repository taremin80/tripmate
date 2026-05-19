import React, { useState } from 'react'
import EditDeleteMenu from '../components/EditDeleteMenu'

export function PhotoTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ url:'', caption:'' })
  const [editingId, setEditingId] = useState(null)

  function openAdd() { setEditingId(null); setForm({url:'',caption:''}); setShowModal(true) }
  function openEdit(p) { setEditingId(p.id); setForm({url:p.url,caption:p.caption||''}); setShowModal(true) }
  function deletePhoto(id) { onUpdate({...trip, photos:trip.photos.filter(p=>p.id!==id)}) }
  function save() {
    if (!form.url) return
    const item = { id:editingId||Date.now(), ...form }
    const photos = editingId ? trip.photos.map(p=>p.id===editingId?item:p) : [...trip.photos, item]
    onUpdate({...trip, photos})
    setShowModal(false)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <h1>사진</h1>
        <button onClick={openAdd} style={{color:'#fff',fontSize:13,display:'flex',alignItems:'center',gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>추가
        </button>
      </div>
      <div className="screen">
        {trip.photos.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>사진이 없어요</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {trip.photos.map(p=>(
            <div key={p.id} style={{borderRadius:10,overflow:'hidden',position:'relative',background:'var(--gray-100)'}}>
              <img src={p.url} alt={p.caption} style={{width:'100%',height:130,objectFit:'cover',display:'block'}} onError={e=>e.target.style.opacity='.2'}/>
              <div style={{position:'absolute',top:6,right:6}}>
                <EditDeleteMenu onEdit={()=>openEdit(p)} onDelete={()=>deletePhoto(p.id)}/>
              </div>
              {p.caption&&<div style={{padding:'6px 8px',fontSize:11,color:'var(--gray-600)',background:'var(--gray-50)',borderTop:'1px solid var(--gray-100)'}}>{p.caption}</div>}
            </div>
          ))}
        </div>
        <button onClick={openAdd} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:10}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>사진 추가
        </button>
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{editingId?'사진 수정':'사진 추가'}</div>
            <div className="form-group">
              <label className="form-label">이미지 URL *</label>
              <input className="form-input" placeholder="https://..." value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">설명</label>
              <input className="form-input" placeholder="도톤보리 야경" value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})}/>
            </div>
            <button className="btn-primary" onClick={save}>{editingId?'수정 완료':'추가하기'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function NoticeTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', author:'나' })
  const [editingId, setEditingId] = useState(null)

  function openAdd() { setEditingId(null); setForm({title:'',content:'',author:'나'}); setShowModal(true) }
  function openEdit(n) { setEditingId(n.id); setForm({title:n.title,content:n.content||'',author:n.author||'나'}); setShowModal(true) }
  function deleteNotice(id) { onUpdate({...trip, notices:trip.notices.filter(n=>n.id!==id)}) }
  function togglePin(id) {
    onUpdate({...trip, notices:trip.notices.map(n=>n.id===id?{...n,pinned:!n.pinned}:n)})
  }
  function save() {
    if (!form.title) return
    const item = { id:editingId||Date.now(), ...form, pinned:false, date:new Date().toISOString().split('T')[0] }
    const notices = editingId
      ? trip.notices.map(n=>n.id===editingId?{...item,pinned:trip.notices.find(x=>x.id===editingId)?.pinned||false}:n)
      : [item, ...trip.notices]
    onUpdate({...trip, notices})
    setShowModal(false)
  }

  const pinned = trip.notices.filter(n=>n.pinned)
  const normal = trip.notices.filter(n=>!n.pinned)

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <h1>공지</h1>
        <button onClick={openAdd} style={{color:'#fff',fontSize:13,display:'flex',alignItems:'center',gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>작성
        </button>
      </div>
      <div className="screen">
        {pinned.length>0&&<><div className="section-label">📌 고정 공지</div>{pinned.map(n=><NoticeCard key={n.id} notice={n} onEdit={()=>openEdit(n)} onDelete={()=>deleteNotice(n.id)} onTogglePin={()=>togglePin(n.id)}/>)}</>}
        {normal.length>0&&<><div className="section-label">공지사항</div>{normal.map(n=><NoticeCard key={n.id} notice={n} onEdit={()=>openEdit(n)} onDelete={()=>deleteNotice(n.id)} onTogglePin={()=>togglePin(n.id)}/>)}</>}
        {trip.notices.length===0&&<div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>공지가 없어요</div>}
        <button onClick={openAdd} style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>공지 작성
        </button>
      </div>
      {showModal&&(
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">{editingId?'공지 수정':'공지 작성'}</div>
            <div className="form-group">
              <label className="form-label">제목 *</label>
              <input className="form-input" placeholder="예: 준비물 체크리스트" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">내용</label>
              <textarea className="form-input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} style={{resize:'none'}}/>
            </div>
            <div className="form-group">
              <label className="form-label">작성자</label>
              <input className="form-input" value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/>
            </div>
            <button className="btn-primary" onClick={save}>{editingId?'수정 완료':'작성하기'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function NoticeCard({ notice, onEdit, onDelete, onTogglePin }) {
  return (
    <div className="card" style={notice.pinned?{borderLeft:'3px solid var(--amber)',borderRadius:'0 12px 12px 0'}:{}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <span style={{fontSize:13,fontWeight:600,flex:1}}>{notice.title}</span>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <button onClick={onTogglePin} style={{fontSize:11,color:notice.pinned?'var(--amber)':'var(--gray-400)',background:'none',border:'none',cursor:'pointer'}}>
            {notice.pinned?'📌 고정됨':'📌 고정'}
          </button>
          <EditDeleteMenu onEdit={onEdit} onDelete={onDelete}/>
        </div>
      </div>
      {notice.content&&<div style={{fontSize:12,color:'var(--gray-600)',lineHeight:1.6,marginBottom:6}}>{notice.content}</div>}
      <div style={{fontSize:11,color:'var(--gray-400)'}}>{notice.author} · {notice.date}</div>
    </div>
  )
}
