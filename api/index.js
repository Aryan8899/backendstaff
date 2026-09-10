require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const authRoutes = require('../routes/authRoutes');
const jobRoutes = require('../routes/jobRoutes');
const applicationRoutes = require('../routes/applicationRoutes');
const contactRoutes = require('../routes/contactRoutes');
const subscriberRoutes = require('../routes/subscriberRoutes');

const app = express();

let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribers', subscriberRoutes);

app.get('/api', (req, res) => {
  res.send('Job Portal API is running on Vercel...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

module.exports = app;