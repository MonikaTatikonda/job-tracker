import { useState, useEffect } from 'react'

export default function JobCard({ job, onApply, onSaveChange }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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
  const emoji = emojis[Math.abs((job.job_id || '1').charCodeAt(0)) % emojis.length]

  // Check if already saved on load
  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
    const isSaved = savedList.some(j => j.job_id === job.job_id)
    setSaved(isSaved)
  }, [job.job_id])

  const toggleSave = (e) => {
    e.stopPropagation()
    setSaving(true)
    try {
      const savedList = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
      if (saved) {
        const updated = savedList.filter(j => j.job_id !== job.job_id)
        localStorage.setItem('saved_jobs', JSON.stringify(updated))
        setSaved(false)
      } else {
        const updated = [...savedList, { ...job, savedAt: new Date().toISOString() }]
        localStorage.setItem('saved_jobs', JSON.stringify(updated))
        setSaved(true)
      }
      if (onSaveChange) onSaveChange()
    } catch (err) {
      console.error('Save error:', err)
    }
    setSaving(false)
  }

  return (
    <div
      style={{
        background: '#fff',
        border: score > 70
          ? '1px solid #bbf7d0'
          : '1px solid rgba(10,10,15,0.1)',
        borderLeft: score > 70
          ? '3px solid #16a34a'
          : '1px solid rgba(10,10,15,0.1)',
        borderRadius: 16,
        padding: isMobile ? 14 : 20,
        marginBottom: 12,
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >

      {/* Top section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>

          {/* Company emoji logo */}
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: '#eeeade',
            border: '1px solid rgba(10,10,15,0.1)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18, flexShrink: 0
          }}>
            {emoji}
          </div>

          {/* Job info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? 14 : 15,
              color: '#0a0a0f',
              marginBottom: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {job.job_title}
            </div>
            <div style={{
              fontSize: 13, color: '#7a7870', marginBottom: 6
            }}>
              {job.employer_name} · {job.job_city || job.job_country || 'India'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.job_is_remote && (
                <span style={{
                  padding: '3px 9px', borderRadius: 100, fontSize: 11,
                  fontWeight: 500, background: '#dcfce7',
                  color: '#16a34a', border: '1px solid #bbf7d0'
                }}>
                  🌐 Remote
                </span>
              )}
              <span style={{
                padding: '3px 9px', borderRadius: 100, fontSize: 11,
                fontWeight: 500, background: '#dbeafe',
                color: '#2563eb', border: '1px solid #bfdbfe'
              }}>
                {job.job_employment_type === 'FULLTIME' ? 'Full-time'
                  : job.job_employment_type === 'PARTTIME' ? 'Part-time'
                  : job.job_employment_type === 'CONTRACT' ? 'Contract'
                  : job.job_employment_type === 'INTERN' ? 'Internship'
                  : job.job_employment_type || 'Full-time'}
              </span>
            </div>
          </div>
        </div>

        {/* Score circle */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            width: isMobile ? 56 : 64,
            height: isMobile ? 56 : 64,
            borderRadius: '50%',
            background: c.bg,
            border: `3px solid ${c.border}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 4px'
          }}>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: isMobile ? 15 : 17,
              color: c.text, lineHeight: 1
            }}>
              {score}
            </div>
            <div style={{ fontSize: 9, color: c.text }}>%</div>
          </div>
          <div style={{ fontSize: 10, color: c.text, fontWeight: 600 }}>
            {c.label}
          </div>
        </div>
      </div>

      {/* Score progress bar */}
      {score > 0 && (
        <div style={{
          height: 3, background: '#f0f0f0',
          borderRadius: 2, margin: '12px 0 0'
        }}>
          <div style={{
            width: `${score}%`, height: '100%',
            background: c.bar, borderRadius: 2
          }} />
        </div>
      )}

      {/* Job description */}
      <div style={{
        fontSize: 12, color: '#7a7870',
        lineHeight: 1.6, margin: '10px 0',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {job.job_description?.slice(0, 200)}...
      </div>

      {/* Match reasons */}
      {job.matchReasons?.length > 0 && (
        <div style={{
          display: 'flex', gap: 5,
          flexWrap: 'wrap', marginBottom: 10
        }}>
          {job.matchReasons.slice(0, 3).map((r, i) => (
            <span key={i} style={{
              padding: '3px 9px',
              background: '#eff6ff',
              color: '#2563eb',
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 500,
              border: '1px solid #dbeafe'
            }}>
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex', gap: 8,
        alignItems: 'center',
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>

        {/* Bookmark button */}
        <button
          onClick={toggleSave}
          disabled={saving}
          title={saved ? 'Remove from saved' : 'Save this job'}
          style={{
            padding: '8px 14px',
            background: saved ? '#fef3c7' : 'transparent',
            color: saved ? '#d97706' : '#7a7870',
            border: `1px solid ${saved ? '#fde68a' : 'rgba(10,10,15,0.1)'}`,
            borderRadius: 100,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0
          }}>
          {saving ? '...' : saved ? '🔖' : '🏷️'}
        </button>

        {/* Apply button */}
        <button
          onClick={() => onApply(job)}
          style={{
            padding: isMobile ? '9px 16px' : '9px 20px',
            background: '#0a0a0f',
            color: '#fff',
            border: 'none',
            borderRadius: 100,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: isMobile ? 1 : 'none'
          }}
          onMouseEnter={e => e.target.style.background = '#e85d26'}
          onMouseLeave={e => e.target.style.background = '#0a0a0f'}
        >
          Apply Now →
        </button>
      </div>
    </div>
  )
}

