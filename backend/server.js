// backend/server.js (Updated with CORS fix)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// --- CORS Configuration ---
// We are specifying that only our frontend (running on localhost:5173)
// is allowed to make requests to this backend.
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Smart Resume Screener API is running!');
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/resumeScreener';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  // Start the server after successful DB connection
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
})
.catch(err => {
  console.error('Connection error', err);
  process.exit();
});
