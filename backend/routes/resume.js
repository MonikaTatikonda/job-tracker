let resumeText = ''

module.exports = async (fastify) => {
  fastify.post('/api/resume', async (req, reply) => {
    const data = await req.file()
    const buffer = await data.toBuffer()
    resumeText = buffer.toString('utf-8')
    return { message: 'Resume uploaded successfully', length: resumeText.length }
  })

  fastify.get('/api/resume', async () => {
    return { text: resumeText }
  })
}

module.exports.getResumeText = () => resumeText
