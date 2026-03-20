const { ChatOpenAI } = require('@langchain/openai')
require('dotenv').config()

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0
})

async function runAgent(message) {
  const intentRes = await model.invoke(`
The user said: "${message}"
Classify their intent as exactly one of: filter_update, job_search, help
Return only the intent word, nothing else.
`)

  const intent = intentRes.content.trim()

  if (intent === 'filter_update') {
    const filterRes = await model.invoke(`
The user said: "${message}"
Extract job filters from this message and return ONLY valid JSON.
Use these keys if mentioned: workMode (REMOTE/HYBRID/ONSITE), jobType (FULLTIME/PARTTIME/CONTRACT/INTERN), location, matchScore (high/medium/all)
Example: {"workMode": "REMOTE", "jobType": "FULLTIME"}
Return only the JSON, nothing else.
`)
    let filters = {}
    try {
      const clean = filterRes.content.replace(/```json|```/g, '').trim()
      filters = JSON.parse(clean)
    } catch (e) {}

    return {
      action: 'filter',
      filters,
      reply: 'Got it! Updating your filters now.'
    }
  }

  if (intent === 'job_search') {
    const searchRes = await model.invoke(`
The user wants to search for jobs. They said: "${message}"
Reply helpfully telling them what you understood and that results are being filtered.
Keep it under 2 sentences.
`)
    return {
      action: 'search',
      reply: searchRes.content
    }
  }

  const helpRes = await model.invoke(`
You are a helpful assistant for a job tracker app.
Answer this user question: "${message}"
Keep your answer short, friendly, and practical. Under 3 sentences.
`)
  return {
    action: 'reply',
    reply: helpRes.content
  }
}

module.exports = { runAgent }
