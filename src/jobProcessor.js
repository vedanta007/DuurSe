const { readCompaniesFromExcel } = require('./excelReader');
const { scrapeCompanyJobs } = require('./jobScraper');
const { parseResume } = require('./resumeParser');
const { filterJobsByResumeMatch } = require('./aiMatcher');
const puppeteer = require('puppeteer');
const path = require('path');
const chalk = require('chalk');

async function processJobSearch() {
  try {
    const resumePath = path.join(__dirname, '../uploads/resume.pdf');
    const companiesPath = path.join(__dirname, '../uploads/companies.xlsx');

    // Parse resume
    console.log(chalk.blue('Parsing resume...'));
    const resumeData = await parseResume(resumePath);
    if (!resumeData) {
      throw new Error('Failed to parse resume');
    }

    // Read and filter companies
    const companies = readCompaniesFromExcel(companiesPath);
    if (companies.length === 0) {
      throw new Error('No remote-hiring companies found in the Excel file');
    }

    // Scrape jobs
    console.log(chalk.blue(`Starting job search for ${companies.length} companies...`));
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const jobPromises = companies.map(company => scrapeCompanyJobs(browser, company));
    const jobResults = await Promise.all(jobPromises);
    const allJobs = jobResults.flat();

    await browser.close();

    if (allJobs.length === 0) {
      return { message: 'No remote jobs found', jobs: [] };
    }

    // Match jobs with resume
    const matchedJobs = await filterJobsByResumeMatch(allJobs, resumeData.text);
    
    if (matchedJobs.length === 0) {
      return { message: 'No matching jobs found based on your resume', jobs: [] };
    }

    return {
      message: 'Jobs found successfully',
      jobs: matchedJobs
    };
  } catch (error) {
    throw new Error(`Job processing failed: ${error.message}`);
  }
}

module.exports = { processJobSearch };