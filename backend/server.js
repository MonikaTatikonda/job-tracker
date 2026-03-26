const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const multipart = require('@fastify/multipart')
const jwt = require('@fastify/jwt')
require('dotenv').config()

// Register CORS
fastify.register(cors, { origin: '*' })

// Register multipart for file uploads
fastify.register(multipart)

// Register JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this'
})

// Register all routes
fastify.register(require('./routes/auth'))
fastify.register(require('./routes/jobs'))
fastify.register(require('./routes/resume'))
fastify.register(require('./routes/chat'))
fastify.register(require('./routes/applications'))

const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3001,
      host: '0.0.0.0'
    })
    console.log('Backend running on port 3001')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
