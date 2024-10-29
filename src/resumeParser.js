const fs = require('fs');
const pdf = require('pdf-parse');
const chalk = require('chalk');

async function parseResume(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    return {
      text: data.text,
      info: {
        pages: data.numpages,
        version: data.info.PDFFormatVersion
      }
    };
  } catch (error) {
    console.error(chalk.red('Error parsing resume:', error.message));
    return null;
  }
}

module.exports = { parseResume };