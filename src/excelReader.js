const XLSX = require('xlsx');
const chalk = require('chalk');

function readCompaniesFromExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { 
      header: ['companyName', 'hiringLocations', 'description', 'jobsPage'],
      range: 1 // Skip header row
    });
    
    return data.filter(row => 
      row.companyName && 
      row.jobsPage && 
      row.hiringLocations?.toLowerCase().includes('remote')
    );
  } catch (error) {
    console.error(chalk.red('Error reading Excel file:', error.message));
    return [];
  }
}

module.exports = { readCompaniesFromExcel };