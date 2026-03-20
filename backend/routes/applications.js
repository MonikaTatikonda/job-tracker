let applications = []

module.exports = async (fastify) => {
  fastify.get('/api/applications', async () => applications)

  fastify.post('/api/applications', async (req, reply) => {
    const { job, status } = req.body
    const existing = applications.find(a => a.job.job_id === job.job_id)

    if (existing) {
      existing.status = status
      existing.timeline.push({ status, timestamp: new Date().toISOString() })
    } else {
      applications.push({
        job,
        status,
        timeline: [{ status, timestamp: new Date().toISOString() }]
      })
    }

    return { success: true }
  })
}
