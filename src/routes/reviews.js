const express = require('express');
const router = express.Router({ mergeParams: true });
const { createReview, getReviewsByDestination } = require('../controllers/reviews');
const auth = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/', getReviewsByDestination);

module.exports = router;
