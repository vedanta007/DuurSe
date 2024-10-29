const puppeteer = require('puppeteer');
const chalk = require('chalk');

async function scrapeCompanyJobs(browser, company) {
  const page = await browser.newPage();
  try {
    console.log(chalk.yellow(`Searching ${company.companyName}...`));
    await page.goto(company.jobsPage, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Common job board selectors
    const jobs = await page.evaluate(() => {
      // Generic selectors that work with common job boards
      const jobListings = Array.from(document.querySelectorAll([
        '.job-listing',
        '.careers-listing',
        '.job-card',
        '.position-listing',
        '[data-job-id]',
        '[data-posting-id]'
      ].join(', ')));

      return jobListings.map(job => {
        const titleElement = job.querySelector('h2, h3, h4, [class*="title"]');
        const linkElement = job.querySelector('a') || titleElement?.closest('a');
        const locationElement = job.querySelector('[class*="location"], [data-location]');

        return {
          title: titleElement?.textContent?.trim(),
          link: linkElement?.href,
          location: locationElement?.textContent?.trim()
        };
      }).filter(job => 
        job.title && 
        job.link && 
        job.location?.toLowerCase().includes('remote')
      );
    });

    return jobs.map(job => ({
      company: company.companyName,
      description: company.description,
      ...job
    }));
  } catch (error) {
    console.error(chalk.red(`Error scraping ${company.companyName}:`, error.message));
    return [];
  } finally {
    await page.close();
  }
}

module.exports = { scrapeCompanyJobs };