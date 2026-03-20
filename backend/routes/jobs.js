const axios = require('axios')
const { scoreJob } = require('../services/matcher')

module.exports = async (fastify) => {

  fastify.get('/api/jobs', async (req, reply) => {
    const { title, type, remote } = req.query

    try {
      const query = title || 'software developer india'
      const response = await axios.get(
        'https://jsearch.p.rapidapi.com/search',
        {
          params: {
            query: query,
            page: '1',
            num_pages: '2',
            date_posted: 'all',
            remote_jobs_only: remote === 'true' ? 'true' : undefined
          },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        }
      )

      let jobs = response.data.data || []

      if (type) {
        jobs = jobs.filter(j =>
          j.job_employment_type?.toUpperCase() === type.toUpperCase()
        )
      }

      if (jobs.length === 0) {
        const localJobs = require('../data/jobs.json')
        return localJobs
      }

      return jobs

    } catch (err) {
      console.error('RapidAPI error:', err.message)
      const localJobs = require('../data/jobs.json')
      return localJobs
    }
  })

  fastify.post('/api/jobs/score', async (req, reply) => {
    const { jobs, resume } = req.body
    if (!resume) return reply.status(400).send({ error: 'No resume text provided' })

    const scored = await Promise.all(
      jobs.map(async (job) => {
        try {
          const result = await scoreJob(resume, job)
          return { ...job, matchScore: result.score, matchReasons: result.reasons }
        } catch (err) {
          return { ...job, matchScore: 0, matchReasons: [] }
        }
      })
    )

    return scored.sort((a, b) => b.matchScore - a.matchScore)
  })
}

