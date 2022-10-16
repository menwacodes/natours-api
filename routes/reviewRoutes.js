const express = require('express');
const router = express.Router();

const {getAllReviews, createReview} = require('../controllers/reviewController.js');
const {protect, authorize} = require('../controllers/authController.js');

router
    .route('/')
    .get(getAllReviews)
    .post(protect, authorize('user'), createReview); // only users can create reviews

module.exports = router;