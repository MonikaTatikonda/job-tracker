import { useState, useEffect } from 'react'
import axios from 'axios'
import JobCard from './components/JobCard'
import Filters from './components/Filters'
import ApplyPopup from './components/ApplyPopup'
import ChatBubble from './components/ChatBubble'
import Login from './components/Login'

const API = 'https://job-tracker-7fch.onrender.com'

export default function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [jobs, setJobs] = useState([])
  const [resume, setResume] = useState('')
  const [pendingJob, setPendingJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    title: '', type: '', remote: '',
    matchScore: '', location: '', skills: []
  })

  const isMobile = window.innerWidth <= 768

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('jt_token')
    const savedUser = localStorage.getItem('jt_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      loadJobs()
    }
    setAuthChecked(true)
  }, [])

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
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/jobs`)
      setJobs(res.data)
    } catch (err) {
      console.error('Error loading jobs:', err)
    }
    setLoading(false)
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setResume(ev.target.result)
        alert('Resume uploaded! Click Search to score jobs.')
      }
      reader.readAsText(file)
      return
    }

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
          alert('Could not read PDF. Please try a TXT file.')
          return
        }
        setResume(fullText)
        alert('PDF uploaded! Click Search to score jobs.')
      } catch (err) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setResume(ev.target.result)
          alert('Resume uploaded! Click Search to score jobs.')
        }
        reader.readAsText(file)
      }
      return
    }

    alert('Please upload a PDF or TXT file only.')
  }

  const fetchAndScoreJobs = async () => {
    setLoading(true)
    setShowFilters(false)
    try {
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

      const res = await axios.get(`${API}/api/jobs`, { params })
      let jobList = res.data

      if (resume && resume.length > 0) {
        const scored = await axios.post(`${API}/api/jobs/score`, {
          jobs: jobList, resume
        })
        jobList = scored.data
      } else {
        alert('Please upload your resume first then click Search!')
        setLoading(false)
        return
      }

      if (filters.matchScore) {
        jobList = jobList.filter(j => j.matchScore >= parseInt(filters.matchScore))
      }

      setJobs(jobList)
    } catch (err) {
      console.error('Error:', err)
      alert('Error loading jobs. Please try again.')
    }
    setLoading(false)
  }

  const handleApply = (job) => {
    window.open(job.job_apply_link, '_blank')
    setTimeout(() => setPendingJob(job), 2000)
  }

  const handleFilterUpdate = (aiFilters) => {
    const newFilters = { ...filters }
    if (aiFilters.workMode) newFilters.remote = aiFilters.workMode === 'REMOTE' ? 'true' : 'false'
    if (aiFilters.jobType) newFilters.type = aiFilters.jobType
    if (aiFilters.location) newFilters.location = aiFilters.location
    if (aiFilters.matchScore === 'high') newFilters.matchScore = '70'
    else if (aiFilters.matchScore === 'medium') newFilters.matchScore = '40'
    else if (aiFilters.matchScore === 'all') newFilters.matchScore = ''
    setFilters(newFilters)
  }

  const bestMatches = jobs.filter(j => j.matchScore > 70)
  const strongCount = jobs.filter(j => j.matchScore > 70).length
  const partialCount = jobs.filter(j => j.matchScore >= 40 && j.matchScore <= 70).length

  // Show nothing until auth check is done
  if (!authChecked) return null

  // Show login page if not logged in
  if (!user) return <Login onLogin={handleLogin} />

  // Show main app if logged in
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>

      {/* HEADER */}
      <div style={{
        background: '#0a0a0f', color: '#fff',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        flexWrap: 'wrap', gap: 8
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 18, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{
            width: 8, height: 8, background: '#e85d26',
            borderRadius: '50%', display: 'inline-block'
          }} />
          AI Job Tracker
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* User greeting */}
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.5)',
            display: isMobile ? 'none' : 'block'
          }}>
            👋 {user.name}
          </span>

          {/* Filter toggle for mobile */}
          {isMobile && (
            <button onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 100, padding: '6px 14px',
                fontSize: 12, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif'
              }}>
              {showFilters ? 'Hide' : 'Filters'}
            </button>
          )}

          <label style={{
            fontSize: 12, cursor: 'pointer',
            padding: '7px 14px', borderRadius: 100,
            border: resume ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.2)',
            color: resume ? '#4ade80' : 'rgba(255,255,255,0.7)',
            background: 'transparent', whiteSpace: 'nowrap'
          }}>
            {resume ? '✓ Resume' : '📄 Upload Resume'}
            <input type="file" accept=".txt,.pdf"
              onChange={handleResumeUpload}
              style={{ display: 'none' }} />
          </label>

          <button onClick={fetchAndScoreJobs} disabled={loading}
            style={{
              padding: '8px 20px',
              background: loading ? '#555' : '#e85d26',
              color: '#fff', border: 'none', borderRadius: 100,
              fontFamily: 'Syne, sans-serif', fontWeight: 600,
              fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}>
            {loading ? 'Scoring...' : 'Search'}
          </button>

          {/* Logout button */}
          <button onClick={handleLogout}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 100, padding: '7px 14px',
              fontSize: 12, cursor: 'pointer',
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

        {/* SIDEBAR */}
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
        <div style={{ flex: 1, padding: isMobile ? 14 : 28, overflow: 'hidden' }}>

          {/* STATS BAR */}
          {!loading && jobs.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 12, marginBottom: 24
            }}>
              {[
                { num: jobs.length, label: 'Jobs Found', color: '#0a0a0f' },
                { num: strongCount, label: 'Strong Matches', color: '#16a34a' },
                { num: partialCount, label: 'Partial Matches', color: '#d97706' },
                { num: jobs.filter(j => j.matchScore === 0).length, label: 'Not Scored', color: '#9ca3af' }
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid rgba(10,10,15,0.08)',
                  borderRadius: 14, padding: '14px 18px'
                }}>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: 26, color: s.color, lineHeight: 1, marginBottom: 2
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
              <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 16, color: '#0a0a0f', marginBottom: 8
              }}>
                AI is scoring your jobs...
              </p>
              <p style={{ fontSize: 13, color: '#7a7870' }}>
                This takes 30–60 seconds. Please wait.
              </p>
            </div>
          )}

          {/* BEST MATCHES */}
          {!loading && resume && bestMatches.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 15, color: '#0a0a0f',
                marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8
              }}>
                ⭐ Best Matches
                <span style={{
                  background: '#e85d26', color: '#fff',
                  fontSize: 10, fontWeight: 600,
                  padding: '3px 9px', borderRadius: 100
                }}>
                  {bestMatches.length}
                </span>
              </div>
              {bestMatches.slice(0, 6).map(job => (
                <JobCard key={job.job_id} job={job} onApply={handleApply} />
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid rgba(10,10,15,0.08)', margin: '24px 0' }} />
            </div>
          )}

          {/* ALL JOBS */}
          {!loading && (
            <>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 15, color: '#0a0a0f',
                marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8
              }}>
                All Jobs
                <span style={{
                  background: '#f0f0f0', color: '#555',
                  fontSize: 10, fontWeight: 600,
                  padding: '3px 9px', borderRadius: 100
                }}>
                  {jobs.length}
                </span>
              </div>

              {jobs.map(job => (
                <JobCard key={job.job_id} job={job} onApply={handleApply} />
              ))}

              {jobs.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <p style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: 16, color: '#0a0a0f', marginBottom: 6
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

      {pendingJob && (
        <ApplyPopup job={pendingJob} onClose={() => setPendingJob(null)} />
      )}
      <ChatBubble onFilterUpdate={handleFilterUpdate} />
    </div>
  )
}
