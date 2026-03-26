import { useState, useEffect } from 'react'

export default function SavedJobs({ user, onApply, onBack }) {
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedJobs()
  }, [])

  const loadSavedJobs = () => {
    setLoading(true)
    try {
      const savedList = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
      setSavedJobs(savedList)
    } catch (err) {
      console.error('Error loading saved jobs:', err)
      setSavedJobs([])
    }
    setLoading(false)
  }

  const removeJob = (jobId) => {
    try {
      const savedList = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
      const updated = savedList.filter(j => j.job_id !== jobId)
      localStorage.setItem('saved_jobs', JSON.stringify(updated))
      setSavedJobs(updated)
    } catch (err) {
      console.error('Error removing job:', err)
    }
  }

  const clearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved jobs?')) {
      localStorage.setItem('saved_jobs', '[]')
      setSavedJobs([])
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getScoreColor = (s) => s > 70 ? '#16a34a' : s > 40 ? '#d97706' : '#9ca3af'
  const getScoreBg = (s) => s > 70 ? '#f0fdf4' : s > 40 ? '#fffbeb' : '#f9fafb'
  const getScoreBorder = (s) => s > 70 ? '#bbf7d0' : s > 40 ? '#fde68a' : '#e5e7eb'
  const getScoreLabel = (s) => s > 70 ? 'Strong Match' : s > 40 ? 'Partial Match' : 'Low Match'

  const emojis = ['💼','⚡','🎯','🚀','☁️','🔥','💡','🛠️','🎨','📊']
  const getEmoji = (jobId) => emojis[Math.abs((jobId || '1').charCodeAt(0)) % emojis.length]

  const isMobile = window.innerWidth <= 768

  const strongCount = savedJobs.filter(j => (j.matchScore || 0) > 70).length
  const partialCount = savedJobs.filter(j => (j.matchScore || 0) >= 40 && (j.matchScore || 0) <= 70).length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f6f2',
      fontFamily: 'DM Sans, sans-serif'
    }}>

      {/* HEADER */}
      <div style={{
        background: '#0a0a0f',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 12
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 18,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0
        }}>
          <span style={{
            width: 8, height: 8,
            background: '#e85d26',
            borderRadius: '50%',
            display: 'inline-block'
          }} />
          AI Job Tracker
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 100,
            padding: '8px 18px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
          ← Back to Jobs
        </button>
      </div>

      {/* PAGE CONTENT */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: isMobile ? '20px 14px' : '32px 20px'
      }}>

        {/* PAGE TITLE */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: isMobile ? 22 : 28,
              color: '#0a0a0f',
              marginBottom: 6
            }}>
              🔖 Saved Jobs
            </div>
            <p style={{ color: '#7a7870', fontSize: 14 }}>
              Jobs you bookmarked — saved in your browser
            </p>
          </div>

          {/* Clear all button */}
          {savedJobs.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: '9px 18px',
                background: 'transparent',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: 100,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif'
              }}>
              🗑️ Clear All
            </button>
          )}
        </div>

        {/* STATS CARDS */}
        {savedJobs.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 12,
            marginBottom: 24
          }}>
            {[
              { num: savedJobs.length, label: 'Saved Jobs', color: '#0a0a0f' },
              { num: strongCount, label: 'Strong Matches', color: '#16a34a' },
              { num: partialCount, label: 'Partial Matches', color: '#d97706' }
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid rgba(10,10,15,0.08)',
                borderRadius: 14,
                padding: '14px 18px'
              }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: 26,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 2
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 11, color: '#7a7870', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ color: '#7a7870', fontSize: 14 }}>
              Loading saved jobs...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && savedJobs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(10,10,15,0.08)'
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔖</div>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              color: '#0a0a0f',
              marginBottom: 8
            }}>
              No saved jobs yet
            </div>
            <p style={{
              color: '#7a7870',
              fontSize: 14,
              marginBottom: 28,
              maxWidth: 300,
              margin: '0 auto 28px'
            }}>
              Click the 🏷️ bookmark icon on any job card to save it here for later
            </p>
            <button
              onClick={onBack}
              style={{
                padding: '12px 28px',
                background: '#0a0a0f',
                color: '#fff',
                border: 'none',
                borderRadius: 100,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}>
              Browse Jobs →
            </button>
          </div>
        )}

        {/* SAVED JOBS LIST */}
        {!loading && savedJobs.map((job) => {
          const score = job.matchScore || 0
          const scoreColor = getScoreColor(score)
          const scoreBg = getScoreBg(score)
          const scoreBorder = getScoreBorder(score)
          const scoreLabel = getScoreLabel(score)
          const emoji = getEmoji(job.job_id)

          return (
            <div
              key={job.job_id}
              style={{
                background: '#fff',
                border: score > 70
                  ? '1px solid #bbf7d0'
                  : '1px solid rgba(10,10,15,0.08)',
                borderLeft: score > 70
                  ? '3px solid #16a34a'
                  : '1px solid rgba(10,10,15,0.08)',
                borderRadius: 16,
                padding: isMobile ? 14 : 20,
                marginBottom: 12,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >

              {/* Top row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 10
              }}>
                <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>

                  {/* Emoji logo */}
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: 10,
                    background: '#eeeade',
                    border: '1px solid rgba(10,10,15,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0
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
                      fontSize: 13,
                      color: '#7a7870',
                      marginBottom: 6
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
                      <span style={{
                        padding: '3px 9px', borderRadius: 100, fontSize: 11,
                        fontWeight: 500, background: '#f3f4f6',
                        color: '#6b7280', border: '1px solid #e5e7eb'
                      }}>
                        🕐 Saved {formatDate(job.savedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score circle */}
                {score > 0 && (
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: isMobile ? 54 : 64,
                      height: isMobile ? 54 : 64,
                      borderRadius: '50%',
                      background: scoreBg,
                      border: `3px solid ${scoreBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 4px'
                    }}>
                      <div style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 800,
                        fontSize: isMobile ? 15 : 17,
                        color: scoreColor,
                        lineHeight: 1
                      }}>
                        {score}
                      </div>
                      <div style={{ fontSize: 9, color: scoreColor }}>%</div>
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: scoreColor,
                      fontWeight: 600
                    }}>
                      {score > 70 ? 'Strong' : score > 40 ? 'Partial' : 'Low'}
                    </div>
                  </div>
                )}
              </div>

              {/* Score progress bar */}
              {score > 0 && (
                <div style={{
                  height: 3,
                  background: '#f0f0f0',
                  borderRadius: 2,
                  marginBottom: 10
                }}>
                  <div style={{
                    width: `${score}%`,
                    height: '100%',
                    background: scoreColor,
                    borderRadius: 2
                  }} />
                </div>
              )}

              {/* Job description */}
              <div style={{
                fontSize: 12,
                color: '#7a7870',
                lineHeight: 1.6,
                marginBottom: 10,
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
                  display: 'flex',
                  gap: 5,
                  flexWrap: 'wrap',
                  marginBottom: 12
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
                display: 'flex',
                gap: 8,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>

                {/* Apply button */}
                <button
                  onClick={() => onApply(job)}
                  style={{
                    padding: '10px 22px',
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

                {/* Remove button */}
                <button
                  onClick={() => removeJob(job.job_id)}
                  style={{
                    padding: '10px 18px',
                    background: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: 100,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.15s',
                    flex: isMobile ? 1 : 'none'
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = '#fef2f2'
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
