const express = require('express');
const router = express.Router();
const { createIncident, getAllIncidents, updateIncident, getIncidentById, deleteIncident } = require('../controllers/incidents');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/multerConfig');

router.post('/', [auth, upload.single('media')], createIncident);
router.get('/', getAllIncidents);
router.get('/:id', getIncidentById);
router.put('/:id', [auth, admin], updateIncident);
router.delete('/:id', [auth, admin], deleteIncident);

module.exports = router;
