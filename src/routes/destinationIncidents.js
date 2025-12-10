const express = require('express');
const router = express.Router({ mergeParams: true });
const { getIncidentsByDestination } = require('../controllers/incidents');

router.get('/', getIncidentsByDestination);

module.exports = router;
