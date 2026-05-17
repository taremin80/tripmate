import React, { useState } from 'react'

export function PhotoTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ url:'', caption:'' })

  function addPhoto() {
    if (!form.url) return
    const updated = { ...trip, photos: [...trip.photos, { id: Date.now(), ...form }] }
    onUpdate(updated)
    setForm({ url:'', caption:'' })
    setShowModal(false)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <h1>사진</h1>
        <button onClick={() => setShowModal(true)} style={{color:'#fff',fontSize:13,display:'flex',alignItems:'center',gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          추가
        </button>
      </div>
      <div className="screen">
        {trip.photos.length === 0 && (
          <div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>
            사진이 없어요<br/>
            <span style={{fontSize:12}}>추가 버튼으로 올려보세요</span>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {trip.photos.map(p => (
            <div key={p.id} style={{borderRadius:10,overflow:'hidden',position:'relative'}}>
              <img src={p.url} alt={p.caption} style={{width:'100%',height:130,objectFit:'cover',display:'block'}} onError={e => e.target.style.display='none'} />
              {p.caption && (
                <div style={{padding:'6px 8px',fontSize:11,color:'var(--gray-600)',background:'var(--gray-50)',borderTop:'1px solid var(--gray-100)'}}>
                  {p.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => setShowModal(true)}
          style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:10}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          사진 추가
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">사진 추가</div>
            <div className="form-group">
              <label className="form-label">이미지 URL *</label>
              <input className="form-input" placeholder="https://..." value={form.url} onChange={e => setForm({...form,url:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">설명</label>
              <input className="form-input" placeholder="도톤보리 야경" value={form.caption} onChange={e => setForm({...form,caption:e.target.value})} />
            </div>
            <button className="btn-primary" onClick={addPhoto}>추가하기</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function NoticeTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', author:'나' })

  function addNotice() {
    if (!form.title) return
    const updated = { ...trip, notices: [{ id: Date.now(), ...form, pinned: false, date: new Date().toISOString().split('T')[0] }, ...trip.notices] }
    onUpdate(updated)
    setForm({ title:'', content:'', author:'나' })
    setShowModal(false)
  }

  const pinned = trip.notices.filter(n => n.pinned)
  const normal = trip.notices.filter(n => !n.pinned)

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <h1>공지</h1>
        <button onClick={() => setShowModal(true)} style={{color:'#fff',fontSize:13,display:'flex',alignItems:'center',gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          작성
        </button>
      </div>
      <div className="screen">
        {pinned.length > 0 && (
          <>
            <div className="section-label">📌 고정 공지</div>
            {pinned.map(n => <NoticeCard key={n.id} notice={n} />)}
          </>
        )}
        {normal.length > 0 && (
          <>
            <div className="section-label">공지사항</div>
            {normal.map(n => <NoticeCard key={n.id} notice={n} />)}
          </>
        )}
        {trip.notices.length === 0 && (
          <div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>
            공지가 없어요<br/>
            <span style={{fontSize:12}}>작성 버튼으로 추가해보세요</span>
          </div>
        )}
        <button onClick={() => setShowModal(true)}
          style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          공지 작성
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">공지 작성</div>
            <div className="form-group">
              <label className="form-label">제목 *</label>
              <input className="form-input" placeholder="예: 준비물 체크리스트" value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">내용</label>
              <textarea className="form-input" rows={4} placeholder="공지 내용을 입력하세요" value={form.content} onChange={e => setForm({...form,content:e.target.value})} style={{resize:'none'}} />
            </div>
            <div className="form-group">
              <label className="form-label">작성자</label>
              <input className="form-input" value={form.author} onChange={e => setForm({...form,author:e.target.value})} />
            </div>
            <button className="btn-primary" onClick={addNotice}>작성하기</button>
          </div>
        </div>
      )}
    </div>
  )
}

function NoticeCard({ notice }) {
  return (
    <div className="card" style={notice.pinned ? {borderLeft:'3px solid var(--amber)',borderRadius:'0 12px 12px 0'} : {}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontSize:13,fontWeight:600}}>{notice.title}</span>
        {notice.pinned && <span style={{fontSize:11,color:'var(--amber)'}}>📌 고정</span>}
      </div>
      {notice.content && <div style={{fontSize:12,color:'var(--gray-600)',lineHeight:1.6,marginBottom:6}}>{notice.content}</div>}
      <div style={{fontSize:11,color:'var(--gray-400)'}}>{notice.author} · {notice.date}</div>
    </div>
  )
}
