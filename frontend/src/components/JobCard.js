export default function JobCard({ job, onApply }) {
  const score = job.matchScore || 0
  const level = score > 70 ? 'high' : score > 40 ? 'mid' : 'low'
  const colors = {
    high: { bar: '#16a34a', text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Strong' },
    mid:  { bar: '#d97706', text: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Partial' },
    low:  { bar: '#e5e7eb', text: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', label: 'Low' }
  }
  const c = colors[level]
  const isMobile = window.innerWidth <= 768

  const emojis = ['💼','⚡','🎯','🚀','☁️','🔥','💡','🛠️','🎨','📊']
  const emoji = emojis[Math.abs(job.job_id?.charCodeAt(0) || 0) % emojis.length]

  const handleViewJob = async (job) => {
  const token = localStorage.getItem("token");

  await fetch("https://your-render-url.onrender.com/api/recent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      jobId: job.id,
      title: job.title,
      company: job.company
    })
  });

  // Navigate or open job
};

  return (
    <div style={{
      background: '#fff',
      border: score > 70 ? '1px solid #bbf7d0' : '1px solid rgba(10,10,15,0.1)',
      borderLeft: score > 70 ? '3px solid #16a34a' : '1px solid rgba(10,10,15,0.1)',
      borderRadius: 16,
      padding: isMobile ? 14 : 20,
      marginBottom: 12,
      transition: 'all 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'var(--cream, #eeeade)',
            border: '1px solid rgba(10,10,15,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0
          }}>
            {emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: isMobile ? 14 : 15, color: '#0a0a0f',
              marginBottom: 3, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {job.job_title}
            </div>
            <div style={{ fontSize: 13, color: '#7a7870', marginBottom: 6 }}>
              {job.employer_name} · {job.job_city || job.job_country || 'India'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.job_is_remote && (
                <span style={{
                  padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                  background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0'
                }}>🌐 Remote</span>
              )}
              <span style={{
                padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe'
              }}>
                {job.job_employment_type === 'FULLTIME' ? 'Full-time'
                  : job.job_employment_type === 'PARTTIME' ? 'Part-time'
                  : job.job_employment_type === 'CONTRACT' ? 'Contract'
                  : job.job_employment_type === 'INTERN' ? 'Internship'
                  : job.job_employment_type}
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            width: isMobile ? 56 : 64, height: isMobile ? 56 : 64,
            borderRadius: '50%',
            background: c.bg,
            border: `3px solid ${c.border}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 4px'
          }}>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: isMobile ? 15 : 17, color: c.text, lineHeight: 1
            }}>
              {score}
            </div>
            <div style={{ fontSize: 9, color: c.text }}>%</div>
          </div>
          <div style={{ fontSize: 10, color: c.text, fontWeight: 600 }}>{c.label}</div>
        </div>
      </div>

      {score > 0 && (
        <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, margin: '12px 0 0' }}>
          <div style={{ width: `${score}%`, height: '100%', background: c.bar, borderRadius: 2 }} />
        </div>
      )}

      <div style={{
        fontSize: 12, color: '#7a7870', lineHeight: 1.6,
        margin: '10px 0', overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
      }}>
        {job.job_description?.slice(0, 200)}...
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(job.matchReasons || []).slice(0, 3).map((r, i) => (
            <span key={i} style={{
              padding: '3px 9px', background: '#eff6ff', color: '#2563eb',
              borderRadius: 100, fontSize: 10, fontWeight: 500, border: '1px solid #dbeafe'
            }}>
              {r}
            </span>
          ))}
        </div>
        <button onClick={() => onApply(job)}
          style={{
            padding: isMobile ? '8px 16px' : '9px 20px',
            background: '#0a0a0f', color: '#fff', border: 'none',
            borderRadius: 100, fontFamily: 'Syne, sans-serif',
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 8 : 0
          }}
          onMouseEnter={e => { e.target.style.background = '#e85d26' }}
          onMouseLeave={e => { e.target.style.background = '#0a0a0f' }}>
          Apply Now →
        </button>
      </div>
    </div>

  )
}