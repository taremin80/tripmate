import React, { useState, useRef, useEffect } from 'react'

export default function EditDeleteMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{position:'relative',flexShrink:0}}>
      <button onClick={e=>{e.stopPropagation();setOpen(!open)}}
        style={{width:28,height:28,borderRadius:6,background:'var(--gray-100)',border:'none',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--gray-500)'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
      {open && (
        <div style={{position:'absolute',right:0,top:32,background:'var(--white)',border:'1px solid var(--gray-200)',
          borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,.12)',zIndex:300,minWidth:110,overflow:'hidden'}}>
          <button onClick={e=>{e.stopPropagation();onEdit();setOpen(false)}}
            style={{width:'100%',padding:'11px 14px',border:'none',background:'none',textAlign:'left',
              fontSize:13,color:'var(--gray-800)',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>수정
          </button>
          <div style={{height:1,background:'var(--gray-100)'}}/>
          <button onClick={e=>{e.stopPropagation();onDelete();setOpen(false)}}
            style={{width:'100%',padding:'11px 14px',border:'none',background:'none',textAlign:'left',
              fontSize:13,color:'var(--red)',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>삭제
          </button>
        </div>
      )}
    </div>
  )
}
