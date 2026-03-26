import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import JobCard from './components/JobCard'
import Filters from './components/Filters'
import ApplyPopup from './components/ApplyPopup'
import ChatBubble from './components/ChatBubble'
import Login from './components/Login'
import SavedJobs from './components/SavedJobs'

const API = 'https://job-tracker-7fch.onrender.com'

export default function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [jobs, setJobs] = useState([])
  const [resume, setResume] = useState('')
  const [pendingJob, setPendingJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState('jobs')
  const [savedCount, setSavedCount] = useState(0)
  const [filters, setFilters] = useState({
    title: '', type: '', remote: '',
    matchScore: '', location: '', skills: []
  })

  const isMobile = window.innerWidth <= 768

  // Update saved count from localStorage
  const updateSavedCount = useCallback(() => {
    const savedList = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
    setSavedCount(savedList.length)
  }, [])

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('jt_token')
    const savedUser = localStorage.getItem('jt_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      loadJobs()
    }
    setAuthChecked(true)
    updateSavedCount()
  }, [])

  // Listen for saved jobs changes
  useEffect(() => {
    window.addEventListener('storage', updateSavedCount)
    const interval = setInterval(updateSavedCount, 2000)
    return () => {
      window.removeEventListener('storage', updateSavedCount)
      clearInterval(interval)
    }
  }, [updateSavedCount])

  const handleLogin = (userData) => {
    setUser(userData)
    loadJobs()
  }

  const handleLogout = () => {
    localStorage.removeItem('jt_token')
    localStorage.removeItem('jt_user')
    setUser(null)
    setJobs([])
    setResume('')
    setCurrentPage('jobs')
  }

  // Load jobs without scoring - just show the list first
  const loadJobs = async (resumeText) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/jobs`)
      let jobList = res.data

      // Auto score if resume is available
      const currentResume = resumeText || resume
      if (currentResume && currentResume.length > 50) {
        try {
          const scored = await axios.post(`${API}/api/jobs/score`, {
            jobs: jobList,
            resume: currentResume
          })
          jobList = scored.data
        } catch (err) {
          console.error('Auto scoring failed:', err)
        }
      }

      setJobs(jobList)
    } catch (err) {
      console.error('Error loading jobs:', err)
    }
    setLoading(false)
  }

  // Handle resume upload for both PDF and TXT
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // TXT file
    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target.result
        setResume(text)
        alert('Resume uploaded! Scoring jobs now... Please wait 30-60 seconds.')
        loadJobs(text)
      }
      reader.readAsText(file)
      return
    }

    // PDF file
    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = window['pdfjs-dist/build/pdf']
        if (!pdfjsLib) throw new Error('PDF library not loaded')

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          fullText += textContent.items.map(item => item.str).join(' ') + '\n'
        }

        if (fullText.trim().length === 0) {
          alert('Could not read PDF text. Please try a TXT file instead.')
          return
        }

        setResume(fullText)
        alert('PDF uploaded! Scoring jobs now... Please wait 30-60 seconds.')
        loadJobs(fullText)

      } catch (err) {
        console.error('PDF error:', err)
        // Fallback - read as text
        const reader = new FileReader()
        reader.onload = (ev) => {
          const text = ev.target.result
          setResume(text)
          alert('Resume uploaded! Scoring jobs now...')
          loadJobs(text)
        }
        reader.readAsText(file)
      }
      return
    }

    alert('Please upload a PDF or TXT file only.')
  }

  // Search and score jobs with current filters
  const fetchAndScoreJobs = async () => {
    if (!resume || resume.length < 50) {
      alert('Please upload your resume first then click Search!')
      return
    }

    setLoading(true)
    setShowFilters(false)

    try {
      // Build search query
      const params = {}
      let searchQuery = filters.title || ''
      if (filters.skills?.length > 0) {
        searchQuery = `${searchQuery} ${filters.skills.join(' ')}`.trim()
      }
      if (filters.location) {
        searchQuery = `${searchQuery} ${filters.location}`.trim()
      }
      if (searchQuery) params.title = searchQuery
      if (filters.type) params.type = filters.type
      if (filters.remote) params.remote = filters.remote

      console.log('Fetching jobs with params:', params)
      const res = await axios.get(`${API}/api/jobs`, { params })
      let jobList = res.data
      console.log('Jobs fetched:', jobList.length)

      // Score all jobs against resume
      console.log('Scoring jobs... resume length:', resume.length)
      const scored = await axios.post(`${API}/api/jobs/score`, {
        jobs: jobList,
        resume: resume
      })
      jobList = scored.data
      console.log('Scored! First job score:', jobList[0]?.matchScore)

      // Apply match score filter if set
      if (filters.matchScore) {
        jobList = jobList.filter(j => (j.matchScore || 0) >= parseInt(filters.matchScore))
      }

      setJobs(jobList)

    } catch (err) {
      console.error('Error fetching or scoring jobs:', err)
      alert('Error loading jobs. Please check your connection and try again.')
    }

    setLoading(false)
  }

  const handleApply = (job) => {
    window.open(job.job_apply_link, '_blank')
    setTimeout(() => setPendingJob(job), 2000)
  }

  const handleFilterUpdate = (aiFilters) => {
    const newFilters = { ...filters }
    if (aiFilters.workMode) {
      newFilters.remote = aiFilters.workMode === 'REMOTE' ? 'true' : 'false'
    }
    if (aiFilters.jobType) newFilters.type = aiFilters.jobType
    if (aiFilters.location) newFilters.location = aiFilters.location
    if (aiFilters.matchScore === 'high') newFilters.matchScore = '70'
    else if (aiFilters.matchScore === 'medium') newFilters.matchScore = '40'
    else if (aiFilters.matchScore === 'all') newFilters.matchScore = ''
    setFilters(newFilters)
  }

  const bestMatches = jobs.filter(j => (j.matchScore || 0) > 70)
  const strongCount = jobs.filter(j => (j.matchScore || 0) > 70).length
  const partialCount = jobs.filter(j => (j.matchScore || 0) >= 40 && (j.matchScore || 0) <= 70).length
  const notScored = jobs.filter(j => !j.matchScore || j.matchScore === 0).length

  // Show nothing until auth check is done
  if (!authChecked) return null

  // Show login page if not logged in
  if (!user) return <Login onLogin={handleLogin} />

  // Show saved jobs page
  if (currentPage === 'saved') {
    return (
      <SavedJobs
        user={user}
        onApply={handleApply}
        onBack={() => setCurrentPage('jobs')}
      />
    )
  }

  // Show main app
  return (
    <div style={{
      fontFamily: 'DM Sans, sans-serif',
      minHeight: '100vh',
      background: '#f7f6f2'
    }}>

      {/* HEADER */}
      <div style={{
        background: '#0a0a0f',
        color: '#fff',
        padding: '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 8
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 18,
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

        {/* Right side buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap'
        }}>

          {/* User greeting - desktop only */}
          {!isMobile && (
            <span style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)'
            }}>
              👋 {user.name}
            </span>
          )}

          {/* Filter toggle - mobile only */}
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 100,
                padding: '6px 12px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif'
              }}>
              {showFilters ? 'Hide' : '⚙️ Filters'}
            </button>
          )}

          {/* Saved jobs button */}
          <button
            onClick={() => setCurrentPage('saved')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 100,
              padding: '7px 14px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
            🔖 Saved
            {savedCount > 0 && (
              <span style={{
                background: '#e85d26',
                color: '#fff',
                borderRadius: '50%',
                width: 18, height: 18,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Resume upload button */}
          <label style={{
            fontSize: 12,
            cursor: 'pointer',
            padding: '7px 14px',
            borderRadius: 100,
            border: resume
              ? '1px solid #4ade80'
              : '1px solid rgba(255,255,255,0.2)',
            color: resume ? '#4ade80' : 'rgba(255,255,255,0.7)',
            background: 'transparent',
            whiteSpace: 'nowrap'
          }}>
            {resume ? '✓ Resume' : '📄 Upload Resume'}
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleResumeUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Search button */}
          <button
            onClick={fetchAndScoreJobs}
            disabled={loading}
            style={{
              padding: '8px 18px',
              background: loading ? '#555' : '#e85d26',
              color: '#fff',
              border: 'none',
              borderRadius: 100,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}>
            {loading ? 'Scoring...' : 'Search'}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 100,
              padding: '7px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif'
            }}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: 'calc(100vh - 64px)'
      }}>

        {/* SIDEBAR FILTERS */}
        <div style={{
          width: isMobile ? '100%' : 260,
          display: isMobile ? (showFilters ? 'block' : 'none') : 'block',
          borderRight: isMobile ? 'none' : '1px solid rgba(10,10,15,0.08)',
          borderBottom: isMobile ? '1px solid rgba(10,10,15,0.08)' : 'none',
          background: '#eeeade',
          flexShrink: 0
        }}>
          <Filters filters={filters} onChange={setFilters} />
        </div>

        {/* JOBS AREA */}
        <div style={{
          flex: 1,
          padding: isMobile ? 14 : 28,
          overflow: 'hidden'
        }}>

          {/* UPLOAD PROMPT - show when no resume */}
          {!resume && !loading && (
            <div style={{
              background: '#fff',
              border: '1px dashed rgba(232,93,38,0.4)',
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700, fontSize: 15,
                  color: '#0a0a0f', marginBottom: 4
                }}>
                  Upload your resume to see match scores
                </div>
                <div style={{ fontSize: 13, color: '#7a7870' }}>
                  AI will compare your resume to each job and show a match percentage
                </div>
              </div>
              <label style={{
                padding: '10px 22px',
                background: '#e85d26', color: '#fff',
                borderRadius: 100, fontSize: 13,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                📄 Upload Resume (PDF or TXT)
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleResumeUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {/* STATS BAR */}
          {!loading && jobs.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 12,
              marginBottom: 24
            }}>
              {[
                { num: jobs.length, label: 'Jobs Found', color: '#0a0a0f' },
                { num: strongCount, label: 'Strong Matches', color: '#16a34a' },
                { num: partialCount, label: 'Partial Matches', color: '#d97706' },
                { num: notScored, label: 'Not Scored', color: '#9ca3af' }
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
                  <div style={{
                    fontSize: 11,
                    color: '#7a7870',
                    fontWeight: 500
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#0a0a0f',
                marginBottom: 8
              }}>
                AI is scoring your jobs...
              </p>
              <p style={{ fontSize: 13, color: '#7a7870' }}>
                This takes 30–60 seconds. Please wait.
              </p>
            </div>
          )}

          {/* BEST MATCHES SECTION */}
          {!loading && resume && bestMatches.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: '#0a0a0f',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                ⭐ Best Matches
                <span style={{
                  background: '#e85d26',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: 100
                }}>
                  {bestMatches.length}
                </span>
              </div>
              {bestMatches.slice(0, 6).map(job => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onApply={handleApply}
                  onSaveChange={updateSavedCount}
                />
              ))}
              <hr style={{
                border: 'none',
                borderTop: '1px solid rgba(10,10,15,0.08)',
                margin: '24px 0'
              }} />
            </div>
          )}

          {/* ALL JOBS SECTION */}
          {!loading && (
            <>
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: '#0a0a0f',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                All Jobs
                <span style={{
                  background: '#f0f0f0',
                  color: '#555',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: 100
                }}>
                  {jobs.length}
                </span>
              </div>

              {jobs.map(job => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onApply={handleApply}
                  onSaveChange={updateSavedCount}
                />
              ))}

              {jobs.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <p style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#0a0a0f',
                    marginBottom: 6
                  }}>
                    No jobs found
                  </p>
                  <p style={{ fontSize: 13, color: '#7a7870' }}>
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* APPLY POPUP */}
      {pendingJob && (
        <ApplyPopup
          job={pendingJob}
          onClose={() => setPendingJob(null)}
        />
      )}

      {/* AI CHAT BUBBLE */}
      <ChatBubble onFilterUpdate={handleFilterUpdate} />
    </div>
  )
}
