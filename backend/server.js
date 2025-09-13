const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-resume-screener-lemon.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions)); 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

app.get('/', (req, res) => {
  res.send('Smart Resume Screener API is running live!');
});


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('Successfully connected to MongoDB Atlas.');
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});