// src/app.js
const express = require('express');
const cors = require('cors');
// const routes = require('./routes'); // contoh, sesuaikan

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes utamamu
// app.use('/api', routes);
app.get('/', (req, res) => {
  res.json({ message: 'TravSecure API running' });
});

module.exports = app;
