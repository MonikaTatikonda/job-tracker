import { useState } from 'react'
import axios from 'axios'

const API = 'https://job-tracker-7fch.onrender.com'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password })

      if (res.data.success) {
        // Save token to localStorage
        localStorage.setItem('jt_token', res.data.token)
        localStorage.setItem('jt_user', JSON.stringify(res.data.user))
        onLogin(res.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    }

    setLoading(false)
  }

  const fillTestCreds = () => {
    setEmail('test@gmail.com')
    setPassword('test@123')
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'DM Sans, sans-serif'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(232,93,38,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(37,99,235,0.06) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40
        }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800, fontSize: 28,
            color: '#fff',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            marginBottom: 8
          }}>
            <span style={{
              width: 10, height: 10,
              background: '#e85d26',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulse 2s infinite'
            }} />
            AI Job Tracker
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Find your perfect job with AI matching
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: 36,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700, fontSize: 22,
            color: '#0a0a0f', marginBottom: 6
          }}>
            Welcome back
          </h2>
          <p style={{
            color: '#7a7870', fontSize: 14, marginBottom: 28
          }}>
            Sign in to access your job tracker
          </p>

          {/* Error message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              color: '#dc2626',
              fontSize: 13,
              marginBottom: 20
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>

            {/* Email field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 500, color: '#7a7870',
                marginBottom: 7, letterSpacing: 0.5
              }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="test@gmail.com"
                required
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid rgba(10,10,15,0.12)',
                  borderRadius: 12, fontSize: 14,
                  color: '#0a0a0f', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  background: '#f7f6f2',
                  transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#e85d26'}
                onBlur={e => e.target.style.borderColor = 'rgba(10,10,15,0.12)'}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 500, color: '#7a7870',
                marginBottom: 7, letterSpacing: 0.5
              }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="test@123"
                  required
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    border: '1px solid rgba(10,10,15,0.12)',
                    borderRadius: 12, fontSize: 14,
                    color: '#0a0a0f', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    background: '#f7f6f2',
                    transition: 'border 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#e85d26'}
                  onBlur={e => e.target.style.borderColor = 'rgba(10,10,15,0.12)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#7a7870', cursor: 'pointer',
                    fontSize: 16
                  }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#7a7870' : '#0a0a0f',
                color: '#fff', border: 'none',
                borderRadius: 12, fontSize: 15,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', marginBottom: 12
              }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 12, margin: '16px 0'
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(10,10,15,0.08)' }} />
              <span style={{ fontSize: 12, color: '#7a7870' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(10,10,15,0.08)' }} />
            </div>

            {/* Test credentials button */}
            <button
              type="button"
              onClick={fillTestCreds}
              style={{
                width: '100%', padding: '12px',
                background: '#f0f9ff',
                color: '#2563eb',
                border: '1px solid #dbeafe',
                borderRadius: 12, fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
              🧪 Use Test Credentials
            </button>
          </form>
        </div>

        {/* Test credentials hint */}
        <div style={{
          marginTop: 20, textAlign: 'center',
          padding: '14px 20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>
            Test credentials for this assignment:
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>
            📧 test@gmail.com &nbsp;·&nbsp; 🔑 test@123
          </p>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

