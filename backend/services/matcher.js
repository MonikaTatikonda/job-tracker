const { ChatOpenAI } = require('@langchain/openai')
const { PromptTemplate } = require('@langchain/core/prompts')
require('dotenv').config()

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0
})

const prompt = PromptTemplate.fromTemplate(`
You are a job matching expert. Compare this resume to the job and give a match score.

Return ONLY valid JSON in this exact format, nothing else:
{{"score": 75, "reasons": ["Has React experience", "Knows Node.js", "Missing Python skills"]}}

RESUME:
{resume}

JOB TITLE: {title}
JOB DESCRIPTION: {description}
`)

async function scoreJob(resume, job) {
  const chain = prompt.pipe(model)
  const result = await chain.invoke({
    resume,
    title: job.job_title,
    description: job.job_description.slice(0, 600)
  })

  const clean = result.content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

module.exports = { scoreJob }
