import { useState } from 'react'
import axios from 'axios'

export default function ChatBubble({ onFilterUpdate }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I can help you find jobs. Try: "Show remote jobs" or "Filter full-time roles".' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999 }}>
      {open && (
        <div style={{ width: 330, height: 420, border: '1px solid #e0e0e0', borderRadius: 14,
                      background: '#fff', display: 'flex', flexDirection: 'column',
                      marginBottom: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee',
                        fontWeight: 600, fontSize: 15 }}>
            AI Job Assistant
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.from === 'user' ? 'right' : 'left', margin: '6px 0' }}>
                <span style={{
                  background: m.from === 'user' ? '#2563eb' : '#f0f0f0',
                  color: m.from === 'user' ? '#fff' : '#333',
                  padding: '8px 12px', borderRadius: 10, display: 'inline-block',
                  fontSize: 13, maxWidth: '85%', textAlign: 'left', lineHeight: 1.5
                }}>
                  {m.text}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ color: '#aaa', fontSize: 13, padding: '4px 0' }}>Thinking...</div>
            )}
          </div>
          <div style={{ display: 'flex', padding: 10, borderTop: '1px solid #eee', gap: 8 }}>
            <input value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: '7px 10px', border: '1px solid #ddd',
                       borderRadius: 8, fontSize: 13, outline: 'none' }} />
            <button onClick={send}
              style={{ background: '#2563eb', color: '#fff', border: 'none',
                       borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        style={{ width: 54, height: 54, borderRadius: '50%', background: '#2563eb',
                 color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer',
                 boxShadow: '0 2px 10px rgba(37,99,235,0.4)', display: 'block', marginLeft: 'auto' }}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}
