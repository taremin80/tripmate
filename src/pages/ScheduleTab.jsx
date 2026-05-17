import React, { useState } from 'react'
import { categoryConfig } from '../data/sampleData'

const DATES = ['06/03', '06/04', '06/05', '06/06', '06/07']
const DAYS  = ['화', '수', '목', '금', '토']

function getDateKey(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`
}

export default function ScheduleTab({ trip, onUpdate }) {
  const [activeDate, setActiveDate] = useState(DATES[0])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ time:'', title:'', note:'', category:'sightseeing' })

  const filtered = trip.schedules.filter(s => getDateKey(s.date) === activeDate)

  function addSchedule() {
    if (!form.title) return
    const dateStr = `2025-${activeDate.replace('/','-')}`
    const updated = { ...trip, schedules: [...trip.schedules, { id: Date.now(), date: dateStr, ...form }] }
    onUpdate(updated)
    setForm({ time:'', title:'', note:'', category:'sightseeing' })
    setShowModal(false)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      {/* 날짜 탭 */}
      <div style={{display:'flex',background:'var(--white)',borderBottom:'1px solid var(--gray-200)',overflowX:'auto'}}>
        {DATES.map((d,i) => (
          <button key={d} onClick={() => setActiveDate(d)}
            style={{
              flex:'0 0 auto', padding:'10px 14px', fontSize:12, fontWeight:500,
              color: activeDate===d ? 'var(--purple)' : 'var(--gray-400)',
              borderBottom: activeDate===d ? '2px solid var(--purple)' : '2px solid transparent',
              background:'none', whiteSpace:'nowrap'
            }}>
            {d} ({DAYS[i]})
          </button>
        ))}
      </div>

      <div className="screen" style={{background:'var(--white)'}}>
        {filtered.length === 0 && (
          <div style={{textAlign:'center',color:'var(--gray-400)',padding:'40px 0',fontSize:14}}>
            이 날 일정이 없어요<br/>
            <span style={{fontSize:12}}>아래 버튼으로 추가해보세요</span>
          </div>
        )}
        {filtered.map((item, idx) => {
          const cat = categoryConfig[item.category] || categoryConfig.etc
          return (
            <div key={item.id} style={{display:'flex',gap:10,marginBottom:4}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:12}}>
                <div className="timeline-dot" style={{background:cat.color,marginTop:18}} />
                {idx < filtered.length-1 && <div className="timeline-line" />}
              </div>
              <div style={{flex:1,paddingBottom:16}}>
                <div style={{fontSize:11,color:'var(--gray-400)',marginBottom:3}}>{item.time}</div>
                <div className="card" style={{marginBottom:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:600}}>{item.title}</span>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:cat.bg,color:cat.color,fontWeight:500,whiteSpace:'nowrap',marginLeft:8}}>{cat.icon} {cat.label}</span>
                  </div>
                  {item.note && <div style={{fontSize:11,color:'var(--gray-600)'}}>{item.note}</div>}
                </div>
              </div>
            </div>
          )
        })}
        <button onClick={() => setShowModal(true)}
          style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          일정 추가
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">일정 추가 — {activeDate}</div>
            <div className="form-group">
              <label className="form-label">시간</label>
              <input className="form-input" type="time" value={form.time} onChange={e => setForm({...form,time:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">제목 *</label>
              <input className="form-input" placeholder="예: 오사카성 관광" value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select className="form-input" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                {Object.entries(categoryConfig).map(([k,v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">메모</label>
              <input className="form-input" placeholder="추가 정보나 메모" value={form.note} onChange={e => setForm({...form,note:e.target.value})} />
            </div>
            <button className="btn-primary" onClick={addSchedule}>추가하기</button>
          </div>
        </div>
      )}
    </div>
  )
}
