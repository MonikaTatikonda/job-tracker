import axios from 'axios'

export default function ApplyPopup({ job, onClose }) {
  const respond = async (status) => {
    if (status !== 'browsing') {
      await axios.post('https://job-tracker-7fch.onrender.com/api/applications', { job, status })
    }
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 360,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: 1,
            textTransform: 'uppercase', color: '#7a7870',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            Application Tracker
          </span>
        </div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: 17, color: '#0a0a0f', lineHeight: 1.3, marginBottom: 6
        }}>
          Did you apply to {job?.job_title}?
        </div>
        <div style={{ fontSize: 13, color: '#7a7870', marginBottom: 24 }}>
          at {job?.employer_name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => respond('Applied')}
            style={{
              padding: 14, background: '#0a0a0f', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 14,
              fontWeight: 500, cursor: 'pointer', width: '100%',
              fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.15s'
            }}>
            ✅ Yes, I applied!
          </button>
          <button onClick={() => respond('Applied Earlier')}
            style={{
              padding: 14, background: '#eff6ff', color: '#2563eb',
              border: '1px solid #dbeafe', borderRadius: 12, fontSize: 14,
              fontWeight: 500, cursor: 'pointer', width: '100%',
              fontFamily: 'DM Sans, sans-serif'
            }}>
            📋 I applied earlier
          </button>
          <button onClick={() => respond('browsing')}
            style={{
              padding: 14, background: 'transparent', color: '#7a7870',
              border: '1px solid rgba(10,10,15,0.1)', borderRadius: 12, fontSize: 14,
              fontWeight: 500, cursor: 'pointer', width: '100%',
              fontFamily: 'DM Sans, sans-serif'
            }}>
            Just browsing
          </button>
        </div>
      </div>
    </div>
  )
}

