import { useState, useEffect } from 'react'
import axios from 'axios'
import JobCard from './components/JobCard'
import Filters from './components/Filters'
import ApplyPopup from './components/ApplyPopup'
import ChatBubble from './components/ChatBubble'

export default function App() {
  const [jobs, setJobs] = useState([])
  const [resume, setResume] = useState('')
  const [pendingJob, setPendingJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    title: '', type: '', remote: '', matchScore: '', location: '', skills: []
  })

  const isMobile = window.innerWidth <= 768

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setResume(ev.target.result)
        alert('Resume uploaded successfully! Click Search to score jobs.')
      }
      reader.readAsText(file)
      return
    }

    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = window['pdfjs-dist/build/pdf']
        if (!pdfjsLib) throw new Error('PDF library not loaded')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map(item => item.str).join(' ')
          fullText += pageText + '\n'
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
      if (filters.skills && filters.skills.length > 0) {
        searchQuery = `${searchQuery} ${filters.skills.join(' ')}`.trim()
      }
      if (filters.location) {
        searchQuery = `${searchQuery} ${filters.location}`.trim()
      }
      if (searchQuery) params.title = searchQuery
      if (filters.type) params.type = filters.type
      if (filters.remote) params.remote = filters.remote

      const res = await axios.get('https://job-tracker-7fch.onrender.com/api/jobs', { params })
      let jobList = res.data

      if (resume && resume.length > 0) {
        const scored = await axios.post('https://job-tracker-7fch.onrender.com/api/jobs/score', {
          jobs: jobList,
          resume: resume
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

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        const res = await axios.get('https://job-tracker-7fch.onrender.com/api/jobs')
        setJobs(res.data)
      } catch (err) {
        console.error('Error loading jobs:', err)
      }
      setLoading(false)
    }
    loadJobs()
  }, [])

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

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8f9fb' }}>

      {/* Header */}
      <div style={{
        background: '#2563eb', color: '#fff',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8
      }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>AI Job Tracker</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

          {/* Filter toggle button - only on mobile */}
          <button onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 6, padding: '6px 12px',
              fontSize: 13, cursor: 'pointer',
              display: isMobile ? 'block' : 'none'
            }}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>

          <label style={{
            fontSize: 12, cursor: 'pointer',
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 10px', borderRadius: 6,
            whiteSpace: 'nowrap'
          }}>
            {resume ? '✅ Resume Ready' : '📄 Upload Resume'}
            <input type="file" accept=".txt,.pdf"
              onChange={handleResumeUpload}
              style={{ display: 'none' }} />
          </label>

          <button onClick={fetchAndScoreJobs}
            disabled={loading}
            style={{
              background: loading ? '#93c5fd' : '#fff',
              color: loading ? '#fff' : '#2563eb',
              border: 'none', borderRadius: 6,
              padding: '6px 14px', fontWeight: 600,
              fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}>
            {loading ? 'Scoring...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: 'calc(100vh - 56px)'
      }}>

        {/* Filters sidebar */}
        <div style={{
          width: isMobile ? '100%' : 240,
          display: isMobile ? (showFilters ? 'block' : 'none') : 'block',
          borderRight: isMobile ? 'none' : '1px solid #eee',
          borderBottom: isMobile ? '1px solid #eee' : 'none',
          background: '#fafafa',
          flexShrink: 0
        }}>
          <Filters filters={filters} onChange={setFilters} />
        </div>

        {/* Jobs list */}
        <div style={{ flex: 1, padding: isMobile ? 12 : 20 }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ color: '#2563eb', fontWeight: 500 }}>
                AI is scoring jobs against your resume...
              </p>
              <p style={{ color: '#888', fontSize: 13 }}>
                This takes 30-60 seconds. Please wait.
              </p>
            </div>
          )}

          {!loading && resume && bestMatches.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{
                color: '#2563eb', marginTop: 0,
                fontSize: isMobile ? 15 : 18,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                ⭐ Best Matches
                <span style={{
                  background: '#2563eb', color: '#fff',
                  borderRadius: 20, padding: '2px 10px', fontSize: 13
                }}>
                  {bestMatches.length}
                </span>
              </h3>
              {bestMatches.slice(0, 6).map(job => (
                <JobCard key={job.job_id} job={job} onApply={handleApply} />
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />
            </div>
          )}

          <h3 style={{
            marginTop: 0, fontSize: isMobile ? 15 : 18,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            All Jobs
            <span style={{
              background: '#f0f0f0', color: '#555',
              borderRadius: 20, padding: '2px 10px', fontSize: 13
            }}>
              {jobs.length}
            </span>
          </h3>

          {jobs.map(job => (
            <JobCard key={job.job_id} job={job} onApply={handleApply} />
          ))}

          {!loading && jobs.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60, color: '#888' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16 }}>No jobs found.</p>
              <p style={{ fontSize: 13 }}>Try adjusting your filters.</p>
            </div>
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

