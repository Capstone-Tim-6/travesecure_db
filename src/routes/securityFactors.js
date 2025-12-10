const express = require('express');
const router = express.Router();
const {
  getAllSecurityFactors,
  getSecurityFactorById,
  createSecurityFactor,
  updateSecurityFactor,
  deleteSecurityFactor,
} = require('../controllers/securityFactors');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', getAllSecurityFactors);
router.get('/:id', getSecurityFactorById);
router.post('/', [auth, admin], createSecurityFactor);
router.put('/:id', [auth, admin], updateSecurityFactor);
router.delete('/:id', [auth, admin], deleteSecurityFactor);

module.exports = router;
