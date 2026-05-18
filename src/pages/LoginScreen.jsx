import React, { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setError('로그인에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'var(--purple)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px'
    }}>
      <div style={{
        background:'#fff', borderRadius:24, padding:'36px 28px',
        width:'100%', maxWidth:340, textAlign:'center'
      }}>
        {/* 로고 */}
        <div style={{
          width:64, height:64, borderRadius:18,
          background:'var(--purple-light)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 16px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        <div style={{fontSize:24,fontWeight:700,color:'var(--gray-800)',marginBottom:6}}>TripMate</div>
        <div style={{fontSize:14,color:'var(--gray-400)',marginBottom:32,lineHeight:1.6}}>
          친구들과 함께하는<br/>여행 기록 & 정산 앱
        </div>

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width:'100%', padding:'14px 16px',
            borderRadius:12, border:'1.5px solid var(--gray-200)',
            background: loading ? 'var(--gray-50)' : '#fff',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            fontSize:15, fontWeight:500, color:'var(--gray-800)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition:'background .15s'
          }}>
          {/* 구글 로고 SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.1C9.5 35.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.1-2.2 3.9-4 5.2l6.2 5.2C37 36.8 44 31 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          {loading ? '로그인 중...' : 'Google로 로그인'}
        </button>

        {error && (
          <div style={{marginTop:12,fontSize:12,color:'var(--red)',padding:'8px',background:'var(--red-light)',borderRadius:8}}>
            {error}
          </div>
        )}

        <div style={{marginTop:24,fontSize:11,color:'var(--gray-400)',lineHeight:1.6}}>
          로그인하면 여행 데이터가 안전하게<br/>저장되고 친구와 실시간으로 공유돼요
        </div>
      </div>
    </div>
  )
}
