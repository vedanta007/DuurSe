const fs = require('fs');
const XLSX = require('xlsx');
const chalk = require('chalk');

function saveResults(jobs) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonFile = `remote-jobs-${timestamp}.json`;
  const excelFile = `remote-jobs-${timestamp}.xlsx`;

  // Save as JSON
  fs.writeFileSync(jsonFile, JSON.stringify(jobs, null, 2));

  // Save as Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(jobs);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Remote Jobs');
  XLSX.writeFile(workbook, excelFile);

  return { jsonFile, excelFile };
}

function displayResults(jobs, savedFiles) {
  console.log(chalk.green('\nFound Remote Jobs:'));
  jobs.forEach(job => {
    console.log(chalk.cyan('\n-------------------'));
    console.log(chalk.white(`Company: ${job.company}`));
    console.log(chalk.white(`Title: ${job.title}`));
    console.log(chalk.white(`Location: ${job.location}`));
    console.log(chalk.white(`Link: ${job.link}`));
    console.log(chalk.gray(`Description: ${job.description}`));
    
    if (job.matchDetails) {
      console.log(chalk.green(`\nMatch Score: ${job.matchDetails.matchScore}%`));
      console.log(chalk.green('Matching Skills:'));
      job.matchDetails.matchingSkills.forEach(skill => 
        console.log(chalk.green(`  ✓ ${skill}`))
      );
      console.log(chalk.yellow('Missing Skills:'));
      job.matchDetails.missingSkills.forEach(skill => 
        console.log(chalk.yellow(`  ○ ${skill}`))
      );
    }
  });

  console.log(chalk.green('\nResults saved to:'));
  console.log(chalk.green(`- ${savedFiles.jsonFile}`));
  console.log(chalk.green(`- ${savedFiles.excelFile}`));
}

module.exports = { saveResults, displayResults };