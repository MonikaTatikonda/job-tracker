const allJobs = require('../data/jobs.json')
const { scoreJob } = require('../services/matcher')

let resumeText = ''

module.exports = async (fastify) => {

  fastify.get('/api/jobs', async (req, reply) => {
    const { title, type, remote } = req.query
    let filtered = [...allJobs]

    if (title) {
      filtered = filtered.filter(j =>
        j.job_title.toLowerCase().includes(title.toLowerCase()) ||
        j.job_description.toLowerCase().includes(title.toLowerCase())
      )
    }
    if (type) {
      filtered = filtered.filter(j => j.job_employment_type === type)
    }
    if (remote === 'true') {
      filtered = filtered.filter(j => j.job_is_remote === true)
    }

    return filtered
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
