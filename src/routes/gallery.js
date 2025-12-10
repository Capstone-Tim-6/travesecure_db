const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addGalleryItem,
  getGalleryForDestination,
  deleteGalleryItem,
} = require('../controllers/gallery');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/multerConfig');

router.post('/', [auth, admin, upload.single('media')], addGalleryItem);
router.get('/', getGalleryForDestination);
router.delete('/:gallery_id', [auth, admin], deleteGalleryItem);

module.exports = router;
