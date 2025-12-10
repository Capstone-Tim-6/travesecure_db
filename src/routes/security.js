const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSecurityFactorsByDestinationId, addSecurityFactorToDestination, removeSecurityFactorFromDestination } = require('../controllers/security');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', getSecurityFactorsByDestinationId);
router.post('/:factor_id', [auth, admin], addSecurityFactorToDestination);
router.delete('/:factor_id', [auth, admin], removeSecurityFactorFromDestination);

module.exports = router;
