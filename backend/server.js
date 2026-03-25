const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const multipart = require('@fastify/multipart')
require('dotenv').config()

fastify.register(cors, { origin: '*' })
fastify.register(multipart)

fastify.register(require('./routes/jobs'))
fastify.register(require('./routes/resume'))
fastify.register(require('./routes/chat'))
fastify.register(require('./routes/applications'))

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' })
    console.log('Backend running on http://localhost:3001')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
const recentRoutes = require("./routes/recentRoutes");

app.use("/api/recent", recentRoutes);

start()
