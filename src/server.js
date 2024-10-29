const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { processJobSearch } = require('./jobProcessor');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname === 'resume' ? 'resume.pdf' : 'companies.xlsx';
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Please upload a PDF file for resume'));
      }
    } else if (file.fieldname === 'companies') {
      if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
      } else {
        cb(new Error('Please upload an Excel file (.xlsx) for companies'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'companies', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.resume || !req.files.companies) {
      return res.status(400).json({ error: 'Please upload both resume and companies file' });
    }

    const results = await processJobSearch();
    res.json(results);
  } catch (error) {
    console.error(chalk.red('Error processing files:', error.message));
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(chalk.green(`Server running at http://localhost:${port}`));
});