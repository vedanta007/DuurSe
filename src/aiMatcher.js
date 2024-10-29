const { OpenAI } = require('openai');
const chalk = require('chalk');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function matchJobWithResume(job, resumeText) {
  try {
    const prompt = `
    Job Details:
    Title: ${job.title}
    Company: ${job.company}
    Description: ${job.description}

    Resume: ${resumeText}

    Analyze the job details and the resume, then provide:
    1. A match score (0-100)
    2. Key matching skills
    3. Missing skills
    Format as JSON.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional job matcher. Analyze job requirements and resume content to provide accurate matching scores and insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(chalk.red('Error in AI matching:', error.message));
    return null;
  }
}

async function filterJobsByResumeMatch(jobs, resumeText, minMatchScore = 70) {
  console.log(chalk.blue('\nAnalyzing jobs with AI matching...'));
  
  const matchedJobs = [];
  
  for (const job of jobs) {
    const match = await matchJobWithResume(job, resumeText);
    
    if (match && match.matchScore >= minMatchScore) {
      matchedJobs.push({
        ...job,
        matchDetails: match
      });
    }
  }
  
  return matchedJobs;
}

module.exports = { filterJobsByResumeMatch };