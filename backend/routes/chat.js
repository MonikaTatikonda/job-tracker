const { runAgent } = require('../services/agent')

module.exports = async (fastify) => {
  fastify.post('/api/chat', async (req, reply) => {
    const { message } = req.body
    if (!message) return reply.status(400).send({ error: 'Message is required' })
    const result = await runAgent(message)
    return result
  })
}
