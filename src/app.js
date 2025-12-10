// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint test untuk Vercel
app.get('/api', (req, res) => {
  res.json({ message: 'TravSecure API from Vercel is running' });
});

// TODO: di bawah sini nanti kamu pasang semua routes asli kamu
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

module.exports = app;
