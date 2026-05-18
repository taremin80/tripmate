import React, { useState } from 'react'
import { categoryConfig } from '../data/sampleData'

const CURRENCIES = [
  { code:'KRW', label:'원',           symbol:'₩',   flag:'🇰🇷' },
  { code:'JPY', label:'엔',           symbol:'¥',   flag:'🇯🇵' },
  { code:'USD', label:'달러',         symbol:'$',   flag:'🇺🇸' },
  { code:'EUR', label:'유로',         symbol:'€',   flag:'🇪🇺' },
  { code:'THB', label:'바트',         symbol:'฿',   flag:'🇹🇭' },
  { code:'VND', label:'동',           symbol:'₫',   flag:'🇻🇳' },
  { code:'TWD', label:'대만달러',     symbol:'NT$', flag:'🇹🇼' },
  { code:'HKD', label:'홍콩달러',     symbol:'HK$', flag:'🇭🇰' },
  { code:'SGD', label:'싱가포르달러', symbol:'S$',  flag:'🇸🇬' },
  { code:'CNY', label:'위안',         symbol:'¥',   flag:'🇨🇳' },
]

function toKRW(amount, currency, rate) {
  if (!currency || currency === 'KRW') return amount
  return Math.round(amount * (rate || 1))
}

function formatMoney(amount, currency) {
  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  return `${cur.symbol}${Number(amount).toLocaleString()}`
}

function calcSettlement(expenses, members) {
  const total = expenses.reduce((s, e) => s + toKRW(e.amount, e.currency, e.exchangeRate), 0)
  const perPerson = total / members.length
  const balance = {}
  members.forEach(m => { balance[m.id] = 0 })
  expenses.forEach(e => {
    const krw = toKRW(e.amount, e.currency, e.exchangeRate)
    balance[e.paidBy] = (balance[e.paidBy] || 0) + krw
  })
  members.forEach(m => { balance[m.id] -= perPerson })

  const transactions = []
  const debtors  = members.filter(m => balance[m.id] < -0.5).map(m => ({ ...m, amt: -balance[m.id] }))
  const creditors = members.filter(m => balance[m.id] >  0.5).map(m => ({ ...m, amt:  balance[m.id] }))
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].amt, creditors[j].amt)
    if (amt > 0.5) transactions.push({ from: debtors[i], to: creditors[j], amount: Math.round(amt) })
    debtors[i].amt  -= amt
    creditors[j].amt -= amt
    if (debtors[i].amt  < 0.5) i++
    if (creditors[j].amt < 0.5) j++
  }
  return { total: Math.round(total), perPerson: Math.round(perPerson), transactions }
}

export default function ExpenseTab({ trip, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState({
    category:'food', title:'', amount:'',
    currency:'KRW', exchangeRate:'',
    paidBy: trip.members[0]?.id || 1
  })

  const { total, perPerson, transactions } = calcSettlement(trip.expenses, trip.members)
  const selectedCur = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0]
  const needsRate = form.currency !== 'KRW'

  // 통화별 소계
  const currencySums = {}
  trip.expenses.forEach(e => {
    const key = e.currency || 'KRW'
    currencySums[key] = (currencySums[key] || 0) + e.amount
  })

  function addExpense() {
    if (!form.title || !form.amount) return
    if (needsRate && !form.exchangeRate) return
    const expense = {
      id: Date.now(),
      category: form.category,
      title: form.title,
      amount: parseFloat(form.amount),
      currency: form.currency,
      exchangeRate: needsRate ? parseFloat(form.exchangeRate) : 1,
      paidBy: form.paidBy,
      date: new Date().toISOString().split('T')[0]
    }
    onUpdate({ ...trip, expenses: [...trip.expenses, expense] })
    setForm({ category:'food', title:'', amount:'', currency:'KRW', exchangeRate:'', paidBy: trip.members[0]?.id || 1 })
    setShowModal(false)
  }

  const canSubmit = form.title && form.amount && (!needsRate || form.exchangeRate)

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1}}>
      <div className="app-header" style={{justifyContent:'space-between'}}>
        <h1>경비 · 정산</h1>
        <button onClick={() => setShowModal(true)} style={{color:'#fff',fontSize:13,display:'flex',alignItems:'center',gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          지출 추가
        </button>
      </div>

      {/* 요약 */}
      <div style={{background:'var(--purple)',padding:'0 16px 14px'}}>
        <div style={{display:'flex',gap:10,marginBottom: Object.keys(currencySums).length > 0 ? 8 : 0}}>
          {[
            { label:'총 지출 (원화 환산)', value:'₩'+total.toLocaleString() },
            { label:'1인당', value:'₩'+perPerson.toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{flex:1,background:'rgba(255,255,255,.15)',borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.7)',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{s.value}</div>
            </div>
          ))}
        </div>
        {Object.keys(currencySums).length > 0 && (
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {Object.entries(currencySums).map(([code, sum]) => {
              const cur = CURRENCIES.find(c => c.code === code)
              return (
                <div key={code} style={{background:'rgba(255,255,255,.12)',borderRadius:8,padding:'4px 10px',fontSize:11,color:'rgba(255,255,255,.9)'}}>
                  {cur?.flag} {cur?.symbol}{Math.round(sum).toLocaleString()}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 탭 */}
      <div style={{display:'flex',borderBottom:'1px solid var(--gray-200)',background:'var(--white)'}}>
        {[['list','지출 내역'],['settle','정산 결과']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{flex:1,padding:'11px',fontSize:13,fontWeight:tab===k?600:400,
              color:tab===k?'var(--purple)':'var(--gray-400)',
              borderBottom:tab===k?'2px solid var(--purple)':'2px solid transparent',background:'none'}}>
            {l}
          </button>
        ))}
      </div>

      <div className="screen">
        {tab === 'list' && (
          <>
            <div className="card">
              {trip.expenses.length === 0 && (
                <div style={{textAlign:'center',color:'var(--gray-400)',padding:'20px 0',fontSize:13}}>지출 내역이 없어요</div>
              )}
              {trip.expenses.map((item, idx) => {
                const cat = categoryConfig[item.category] || categoryConfig.etc
                const payer = trip.members.find(m => m.id === item.paidBy)
                const cur = CURRENCIES.find(c => c.code === (item.currency||'KRW')) || CURRENCIES[0]
                const krw = toKRW(item.amount, item.currency, item.exchangeRate)
                return (
                  <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderTop:idx>0?'1px solid var(--gray-100)':'none'}}>
                    <div style={{width:32,height:32,borderRadius:8,background:cat.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                      <div style={{fontSize:10,color:'var(--gray-400)'}}>결제: {payer?.name || '?'}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:600}}>{cur.flag} {formatMoney(item.amount, item.currency)}</div>
                      {item.currency !== 'KRW' && (
                        <div style={{fontSize:10,color:'var(--gray-400)'}}>≈ ₩{krw.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowModal(true)}
              style={{width:'100%',padding:'11px',borderRadius:10,border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-400)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              지출 추가
            </button>
          </>
        )}

        {tab === 'settle' && (
          <>
            <div style={{background:'var(--amber-light)',borderRadius:10,padding:'10px 12px',marginBottom:12,fontSize:12,color:'var(--amber)'}}>
              💱 외화 지출은 입력한 환율 기준으로 원화 환산 후 정산해요
            </div>
            <div className="section-label">정산 결과</div>
            <div className="card">
              {transactions.length === 0
                ? <div style={{textAlign:'center',color:'var(--gray-400)',padding:'16px 0',fontSize:13}}>모두 정산 완료 🎉</div>
                : transactions.map((t,i) => (
                  <div key={i} className="settle-row">
                    <div className="avatar" style={{background:t.from.color,color:t.from.textColor}}>{t.from.initials}</div>
                    <span className="arrow-icon">→</span>
                    <div className="avatar" style={{background:t.to.color,color:t.to.textColor}}>{t.to.initials}</div>
                    <span style={{flex:1,color:'var(--gray-600)'}}>{t.to.name}에게</span>
                    <span style={{fontWeight:600,color:'var(--red)'}}>₩{t.amount.toLocaleString()}</span>
                  </div>
                ))
              }
            </div>
            <div className="section-label">멤버별 지출</div>
            <div className="card">
              {trip.members.map((m,i) => {
                const paid = trip.expenses
                  .filter(e => e.paidBy === m.id)
                  .reduce((s,e) => s + toKRW(e.amount, e.currency, e.exchangeRate), 0)
                return (
                  <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderTop:i>0?'1px solid var(--gray-100)':'none'}}>
                    <div className="avatar" style={{background:m.color,color:m.textColor}}>{m.initials}</div>
                    <span style={{flex:1,fontSize:13}}>{m.name}</span>
                    <span style={{fontSize:13,fontWeight:600}}>₩{Math.round(paid).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-title">지출 추가</div>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select className="form-input" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                {Object.entries(categoryConfig).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">내용 *</label>
              <input className="form-input" placeholder="예: 이치란 라멘" value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">통화 선택</label>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => setForm({...form,currency:c.code,exchangeRate:''})}
                    style={{
                      padding:'5px 9px',borderRadius:20,fontSize:12,fontWeight:500,border:'none',
                      background:form.currency===c.code?'var(--purple)':'var(--gray-100)',
                      color:form.currency===c.code?'#fff':'var(--gray-600)',
                    }}>
                    {c.flag} {c.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">금액 ({selectedCur.label}) *</label>
              <div style={{display:'flex'}}>
                <span style={{padding:'10px 12px',background:'var(--gray-100)',borderRadius:'8px 0 0 8px',fontSize:14,fontWeight:600,color:'var(--gray-600)',border:'1px solid var(--gray-200)',borderRight:'none',whiteSpace:'nowrap'}}>
                  {selectedCur.symbol}
                </span>
                <input className="form-input" type="number" placeholder="0"
                  style={{borderRadius:'0 8px 8px 0'}}
                  value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} />
              </div>
            </div>

            {needsRate && (
              <div className="form-group" style={{background:'var(--purple-light)',borderRadius:10,padding:'10px 12px'}}>
                <label className="form-label" style={{color:'var(--purple)'}}>
                  환율 (1{selectedCur.symbol} = ? 원) *
                </label>
                <input className="form-input" type="number"
                  placeholder={
                    form.currency==='JPY'?'예: 9.5 (1엔 = 9.5원)':
                    form.currency==='USD'?'예: 1350':
                    form.currency==='THB'?'예: 38':'환율 입력'
                  }
                  value={form.exchangeRate}
                  onChange={e => setForm({...form,exchangeRate:e.target.value})} />
                {form.amount && form.exchangeRate && (
                  <div style={{fontSize:11,color:'var(--purple)',marginTop:6,fontWeight:600}}>
                    ≈ ₩{Math.round(parseFloat(form.amount)*parseFloat(form.exchangeRate)).toLocaleString()} 원화 환산
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">결제한 사람</label>
              <select className="form-input" value={form.paidBy} onChange={e => setForm({...form,paidBy:parseInt(e.target.value)})}>
                {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={addExpense} style={{opacity:canSubmit?1:0.5}}>
              추가하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
