const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')
require('dotenv').config()

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0,
  maxRetries: 2
})

const prompt = PromptTemplate.fromTemplate(`
You are a job matching expert. Compare this resume to the job posting.

Return ONLY a valid JSON object in exactly this format with no extra text:
{{"score": 75, "reasons": ["Reason 1", "Reason 2", "Reason 3"]}}

Score rules:
- 70-100: Strong match, most skills align
- 40-69: Partial match, some skills match
- 0-39: Low match, few skills match

RESUME TEXT:
{resume}

JOB TITLE: {title}
JOB DESCRIPTION: {description}

Return only the JSON object:
`)

async function scoreJob(resume, job) {
  try {
    const chain = prompt.pipe(model)
    const result = await chain.invoke({
      resume: resume.slice(0, 1500),
      title: job.job_title || 'Unknown',
      description: (job.job_description || '').slice(0, 800)
    })

    const content = result.content.trim()
    const clean = content.replace(/```json|```/g, '').trim()

    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const parsed = JSON.parse(jsonMatch[0])

    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      reasons: parsed.reasons || []
    }
  } catch (err) {
    console.error('Scoring error for', job.job_title, ':', err.message)
    return { score: 0, reasons: [] }
  }
}

module.exports = { scoreJob }

