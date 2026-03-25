import { useState } from 'react'
import axios from 'axios'

export default function ChatBubble({ onFilterUpdate }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I can help you find jobs. Try: "Show remote jobs" or "Filter full-time roles in Bangalore" 👋' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const isMobile = window.innerWidth <= 768

  const send = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(m => [...m, { from: 'user', text: userMsg }])
    setInput('')
    setLoading(true)
    try {
      const res = await axios.post('https://job-tracker-7fch.onrender.com/api/chat', { message: userMsg })
      setMessages(m => [...m, { from: 'ai', text: res.data.reply }])
      if (res.data.action === 'filter' && res.data.filters) {
        onFilterUpdate(res.data.filters)
      }
    } catch (err) {
      setMessages(m => [...m, { from: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
      {open && (
        <div style={{
          width: isMobile ? 'calc(100vw - 40px)' : 320,
          height: isMobile ? '60vh' : 420,
          background: '#fff', borderRadius: 20,
          border: '1px solid rgba(10,10,15,0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          marginBottom: 12, overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 16px', background: '#0a0a0f',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%' }} />
              <span style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 13, color: '#fff'
              }}>
                AI Job Assistant
              </span>
            </div>
            <button onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                fontSize: 16, cursor: 'pointer'
              }}>✕</button>
          </div>

          <div style={{
            flex: 1, overflow: 'auto', padding: 14,
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '9px 13px',
                  borderRadius: 14,
                  borderBottomLeftRadius: m.from === 'ai' ? 4 : 14,
                  borderBottomRightRadius: m.from === 'user' ? 4 : 14,
                  background: m.from === 'user' ? '#0a0a0f' : '#f7f6f2',
                  color: m.from === 'user' ? '#fff' : '#0a0a0f',
                  fontSize: 12, lineHeight: 1.5,
                  fontFamily: 'DM Sans, sans-serif'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{
                fontSize: 12, color: '#7a7870', padding: '4px 0',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                Thinking...
              </div>
            )}
          </div>

          <div style={{
            padding: 10, borderTop: '1px solid rgba(10,10,15,0.08)',
            display: 'flex', gap: 8
          }}>
            <input value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '8px 14px',
                background: '#f7f6f2',
                border: '1px solid rgba(10,10,15,0.1)',
                borderRadius: 100, fontSize: 12, outline: 'none',
                fontFamily: 'DM Sans, sans-serif', color: '#0a0a0f'
              }} />
            <button onClick={send}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#0a0a0f', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>→</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#0a0a0f', color: '#fff', border: 'none',
          fontSize: 20, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: 'auto', transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}
