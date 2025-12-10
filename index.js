require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./src/routes/auth');
const destinationRoutes = require('./src/routes/destinations');
const securityRoutes = require('./src/routes/security');
const incidentRoutes = require('./src/routes/incidents');
const reviewRoutes = require('./src/routes/reviews');
const destinationIncidentRoutes = require('./src/routes/destinationIncidents');
const galleryRoutes = require('./src/routes/gallery');
const notificationRoutes = require('./src/routes/notifications');
const securityFactorsRoutes = require('./src/routes/securityFactors');


const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security-factors', securityFactorsRoutes);
app.use('/api/destinations/:id/security-factors', securityRoutes);
destinationRoutes.use('/:destination_id/reviews', reviewRoutes);
destinationRoutes.use('/:id/incidents', destinationIncidentRoutes);
destinationRoutes.use('/:destination_id/gallery', galleryRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to TravSecure API');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
