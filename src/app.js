
console.log("APP.JS DIMUAT...");

// src/app.js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');


const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES IMPORTS (path tanpa "src") =====
const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const securityRoutes = require('./routes/security');
const incidentRoutes = require('./routes/incidents');
const reviewRoutes = require('./routes/reviews');
const destinationIncidentRoutes = require('./routes/destinationIncidents');
const galleryRoutes = require('./routes/gallery');
const notificationRoutes = require('./routes/notifications');
const securityFactorsRoutes = require('./routes/securityFactors');

// ===== SWAGGER =====
const swaggerDocument = YAML.load(path.join(process.cwd(), 'swagger.yaml'));
// 1) endpoint JSON spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// 2) swagger UI (biar dia fetch spec dari endpoint di atas)
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(null, {
  swaggerOptions: {
    url: '/api-docs.json'
  }
}));

// ===== MAIN ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security-factors', securityFactorsRoutes);
app.use('/api/destinations/:id/security-factors',securityRoutes);

destinationRoutes.use('/:destination_id/reviews', reviewRoutes);
destinationRoutes.use('/:id/incidents', destinationIncidentRoutes);
destinationRoutes.use('/:destination_id/gallery', galleryRoutes);

// ===== HEALTHCHECK ROUTE =====
app.get('/api', (req, res) => {
  res.json({ message: 'TravSecure API is running!' });
});

// Jangan ada app.listen di sini
module.exports = app;
