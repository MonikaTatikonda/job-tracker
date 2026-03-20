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
  const [filters, setFilters] = useState({
    title: '', type: '', remote: '', matchScore: ''
  })

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // If file is TXT - read directly
    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setResume(ev.target.result)
        alert('Resume uploaded successfully! Click Search to score jobs.')
      }
      reader.readAsText(file)
      return
    }

    // If file is PDF - use window.pdfjsLib from CDN
    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = window['pdfjs-dist/build/pdf']

        if (!pdfjsLib) {
          throw new Error('PDF library not loaded')
        }

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
          alert('Could not read text from PDF. Please try a TXT file instead.')
          return
        }

        setResume(fullText)
        alert('PDF resume uploaded! Click Search to score jobs.')

      } catch (err) {
        console.error('PDF error:', err)

        // Fallback - read as binary text anyway
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
    try {
      const params = {}
      if (filters.title) params.title = filters.title
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
      console.error('Error fetching jobs:', err)
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
    if (aiFilters.matchScore === 'high') newFilters.matchScore = '70'
    else if (aiFilters.matchScore === 'medium') newFilters.matchScore = '40'
    setFilters(newFilters)
  }

  const bestMatches = jobs.filter(j => j.matchScore > 70)

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8f9fb' }}>
      <div style={{ background: '#2563eb', color: '#fff', padding: '16px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>AI Job Tracker</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, cursor: 'pointer', background: 'rgba(255,255,255,0.2)',
                          padding: '6px 12px', borderRadius: 6 }}>
            {resume ? '✅ Resume Ready - Click Search!' : '📄 Upload Resume (PDF or TXT)'}
            <input type="file" accept=".txt,.pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
          </label>
          <button onClick={fetchAndScoreJobs}
            style={{ background: '#fff', color: '#2563eb', border: 'none',
                     borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <Filters filters={filters} onChange={setFilters} />

        <div style={{ flex: 1, padding: 20 }}>
          {loading && (
            <p style={{ color: '#888' }}>Loading and scoring jobs...</p>
          )}

          {!loading && resume && bestMatches.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ color: '#2563eb', marginTop: 0 }}>
                Best Matches ({bestMatches.length})
              </h3>
              {bestMatches.slice(0, 6).map(job => (
                <JobCard key={job.job_id} job={job} onApply={handleApply} />
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 0 }}>All Jobs ({jobs.length})</h3>
          {jobs.map(job => (
            <JobCard key={job.job_id} job={job} onApply={handleApply} />
          ))}

          {!loading && jobs.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
              No jobs found. Try adjusting your filters.
            </p>
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
