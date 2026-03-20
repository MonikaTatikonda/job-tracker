export default function JobCard({ job, onApply }) {
  const score = job.matchScore || 0
  const badge = score > 70 ? { icon: '🟢', color: '#2d6a2d' }
              : score > 40 ? { icon: '🟡', color: '#7a6000' }
              : { icon: '⚪', color: '#666' }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 10, padding: 16,
                  marginBottom: 14, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{job.job_title}</h3>
          <p style={{ margin: '0 0 4px', color: '#555', fontSize: 14 }}>
            {job.employer_name} · {job.job_city}
          </p>
          <p style={{ margin: '0 0 8px', color: '#777', fontSize: 13 }}>
            {job.job_employment_type} · {job.job_is_remote ? '🌐 Remote' : '🏢 On-site'}
          </p>
        </div>
        <div style={{ textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontSize: 22 }}>{badge.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: badge.color }}>{score}% match</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#444', margin: '0 0 12px', lineHeight: 1.5 }}>
        {job.job_description?.slice(0, 180)}...
      </p>

      {job.matchReasons?.length > 0 && (
        <div style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>
          {job.matchReasons.map((r, i) => (
            <span key={i} style={{ background: '#f0f4ff', borderRadius: 4, padding: '2px 7px',
                                   marginRight: 6, display: 'inline-block', marginBottom: 4 }}>
              {r}
            </span>
          ))}
        </div>
      )}

      <button onClick={() => onApply(job)}
        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
                 padding: '8px 18px', fontSize: 14, cursor: 'pointer' }}>
        Apply
      </button>
    </div>
  )
}
