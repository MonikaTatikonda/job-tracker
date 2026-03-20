import axios from 'axios'

export default function ApplyPopup({ job, onClose }) {
  const respond = async (status) => {
    if (status !== 'browsing') {
      await axios.post('http://localhost:3001/api/applications', { job, status })
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.45)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 28, borderRadius: 14,
                    maxWidth: 380, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginTop: 0, fontSize: 17 }}>
          Did you apply to <b>{job?.job_title}</b> at {job?.employer_name}?
        </h3>
        <p style={{ color: '#777', fontSize: 13 }}>Select what happened:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => respond('Applied')}
            style={{ padding: '10px 16px', background: '#2563eb', color: '#fff',
                     border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
            Yes, I applied
          </button>
          <button onClick={() => respond('Applied Earlier')}
            style={{ padding: '10px 16px', background: '#f0f4ff', color: '#2563eb',
                     border: '1px solid #c7d7ff', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
            I applied earlier
          </button>
          <button onClick={() => respond('browsing')}
            style={{ padding: '10px 16px', background: '#f5f5f5', color: '#555',
                     border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
            No, just browsing
          </button>
        </div>
      </div>
    </div>
  )
}
