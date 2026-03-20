export default function JobCard({ job, onApply }) {
  const score = job.matchScore || 0
  const badgeColor = score > 70 ? '#16a34a'
                   : score > 40 ? '#d97706'
                   : '#9ca3af'
  const badgeBg = score > 70 ? '#dcfce7'
                : score > 40 ? '#fef3c7'
                : '#f3f4f6'
  const badgeLabel = score > 70 ? 'Strong Match'
                   : score > 40 ? 'Partial Match'
                   : 'Low Match'

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 10, padding: 18,
                  marginBottom: 14, background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{job.job_title}</h3>
          <p style={{ margin: '0 0 4px', color: '#555', fontSize: 14 }}>
            {job.employer_name} · {job.job_city || job.job_country}
          </p>
          <p style={{ margin: '0 0 8px', color: '#777', fontSize: 13 }}>
            {job.job_employment_type} · {job.job_is_remote ? '🌐 Remote' : '🏢 On-site'}
          </p>
        </div>

        <div style={{ textAlign: 'center', minWidth: 90, marginLeft: 12 }}>
          <div style={{ background: badgeBg, borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: badgeColor }}>
              {score}%
            </div>
            <div style={{ fontSize: 11, color: badgeColor, fontWeight: 500 }}>
              {badgeLabel}
            </div>
          </div>
        </div>
      </div>

      {score > 0 && (
        <div style={{ margin: '8px 0', height: 6, background: '#f0f0f0', borderRadius: 3 }}>
          <div style={{ width: `${score}%`, height: '100%', borderRadius: 3,
                        background: score > 70 ? '#16a34a' : score > 40 ? '#d97706' : '#9ca3af',
                        transition: 'width 0.5s ease' }} />
        </div>
      )}

      <p style={{ fontSize: 13, color: '#444', margin: '8px 0 10px', lineHeight: 1.5 }}>
        {job.job_description?.slice(0, 200)}...
      </p>

      {job.matchReasons?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: '#555', margin: '0 0 6px', fontWeight: 500 }}>
            Skill overlap:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {job.matchReasons.map((r, i) => (
              <span key={i} style={{ background: '#f0f4ff', color: '#2563eb',
                                     borderRadius: 4, padding: '3px 8px',
                                     fontSize: 12, border: '1px solid #c7d7ff' }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => onApply(job)}
        style={{ background: '#2563eb', color: '#fff', border: 'none',
                 borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
        Apply Now
      </button>
    </div>
  )
}
