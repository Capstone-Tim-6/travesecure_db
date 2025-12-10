// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get('/api', (req, res) => {
  res.json({ message: 'TravSecure API is running on Vercel!' });
});

module.exports = app;
