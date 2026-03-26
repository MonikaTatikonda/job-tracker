const bcrypt = require('bcryptjs')

// Test user from the assignment
const TEST_USER = {
  id: '1',
  email: 'test@gmail.com',
  // bcrypt hash of 'test@123'
  passwordHash: bcrypt.hashSync('test@123', 10),
  name: 'Test User'
}

module.exports = async (fastify) => {

  // LOGIN route
  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body

    // Check if fields are provided
    if (!email || !password) {
      return reply.status(400).send({
        error: 'Email and password are required'
      })
    }

    // Check if email matches
    if (email.toLowerCase() !== TEST_USER.email) {
      return reply.status(401).send({
        error: 'Invalid email or password'
      })
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, TEST_USER.passwordHash)
    if (!passwordMatch) {
      return reply.status(401).send({
        error: 'Invalid email or password'
      })
    }

    // Create JWT token
    const token = fastify.jwt.sign(
      { id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name },
      { expiresIn: '7d' }
    )

    return {
      success: true,
      token,
      user: { id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name }
    }
  })

  // VERIFY route - check if token is still valid
  fastify.get('/api/auth/verify', async (req, reply) => {
    try {
      await req.jwtVerify()
      return { valid: true, user: req.user }
    } catch (err) {
      return reply.status(401).send({ valid: false, error: 'Token expired or invalid' })
    }
  })

  // LOGOUT route
  fastify.post('/api/auth/logout', async (req, reply) => {
    return { success: true, message: 'Logged out successfully' }
  })
}

