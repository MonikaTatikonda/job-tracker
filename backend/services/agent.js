const { ChatOpenAI } = require('@langchain/openai')
require('dotenv').config()

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0,
  maxRetries: 2
})

async function runAgent(message) {
  try {
    const intentRes = await model.invoke(`
Classify this message into exactly one intent word.
Message: "${message}"

Rules:
- If they mention remote, onsite, hybrid, full-time, part-time, contract, intern, location, city, match score, high match, filter → reply: filter_update
- If they mention find jobs, search jobs, show jobs, looking for → reply: job_search  
- Anything else → reply: help

Reply with only one word: filter_update, job_search, or help
`)

    const intent = intentRes.content.trim().toLowerCase()
    console.log('Intent detected:', intent)

    if (intent === 'filter_update') {
      const filterRes = await model.invoke(`
Extract job search filters from this message: "${message}"

Return ONLY a valid JSON object using these exact keys if mentioned:
- workMode: use "REMOTE" for remote, "ONSITE" for on-site or onsite, "HYBRID" for hybrid
- jobType: use "FULLTIME" for full time, "PARTTIME" for part time, "CONTRACT" for contract, "INTERN" for internship
- location: city name as a string
- matchScore: use "high" for high match or 70%+, "medium" for medium match, "all" to clear

Only include keys that are mentioned in the message.
Example outputs:
{"workMode": "REMOTE"}
{"jobType": "FULLTIME", "location": "Bangalore"}
{"matchScore": "high"}

Return only the JSON:
`)

      let filters = {}
      try {
        const clean = filterRes.content.replace(/```json|```/g, '').trim()
        const jsonMatch = clean.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          filters = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Filter parse error:', e.message)
      }

      const filterDesc = Object.entries(filters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')

      return {
        action: 'filter',
        filters,
        reply: filters && Object.keys(filters).length > 0
          ? `Done! I have updated your filters — ${filterDesc}. Click Search to see results.`
          : 'I understood you want to filter jobs. Please be more specific, for example: "Show remote jobs" or "Filter full-time roles in Bangalore".'
      }
    }

    if (intent === 'job_search') {
      const searchRes = await model.invoke(`
The user wants to search for jobs. Their message: "${message}"
Give a helpful 2 sentence response telling them:
1. What you understood they are looking for
2. To use the Role/Title field and Skills chips on the left and click Search
`)
      return {
        action: 'search',
        reply: searchRes.content
      }
    }

    const helpRes = await model.invoke(`
You are a helpful AI assistant for a job tracker application.

The app features:
- Job feed showing real jobs from companies like Google, Microsoft, Adobe etc.
- Filters: Role/Title, Location, Skills (React, Node.js etc.), Job Type, Work Mode, Match Score
- Resume upload (PDF or TXT) — upload resume then click Search to get AI match scores
- Match scores: Green = 70%+ strong match, Yellow = 40-70% partial, Gray = below 40%
- Apply tracking: click Apply, a popup asks if you applied, tracks your applications
- AI assistant: that is me! I can update filters and answer questions

Answer this question in 2-3 friendly sentences: "${message}"
`)

    return {
      action: 'reply',
      reply: helpRes.content
    }

  } catch (err) {
    console.error('Agent error:', err.message)
    return {
      action: 'reply',
      reply: 'Sorry, I am having trouble right now. Please try again in a moment.'
    }
  }
}

module.exports = { runAgent }

