const express = require('express');
const router = express.Router();
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destinations');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/multerConfig');

router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);
router.post('/', [auth, admin, upload.array('gallery_media', 10)], createDestination);
router.put('/:id', [auth, admin, upload.array('gallery_media', 10)], updateDestination);
router.delete('/:id', [auth, admin], deleteDestination);

module.exports = router;
