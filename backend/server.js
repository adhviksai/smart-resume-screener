// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// --- CRITICAL FIX for DEPLOYMENT ---
// We must explicitly list the domains that are allowed to make requests to our API.
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend for development
  'https://smart-resume-screener-5daxpb0ae-adhvik-sais-projects.vercel.app' // Your live Vercel frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
  res.send('Smart Resume Screener API is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('Successfully connected to MongoDB.');
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

