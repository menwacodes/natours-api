const express = require('express');
const router = express.Router({mergeParams: true}); // provides access to :tourId

const {getAllReviews, createReview, deleteReview, updateReview, setTourUserIds, getReview} = require('../controllers/reviewController.js');
const {protect, authorize} = require('../controllers/authController.js');

/*
    If the route has been redirected by /:tourId/reviews, so the '/' route will pick it up and
      If there is a :tourId, the router has access to it and it lives on req.params
 */
router
    .route('/')
    .get(getAllReviews)
    .post(protect, authorize('user'), setTourUserIds, createReview); // only users can create reviews

router
    .route('/:id')
    .delete(deleteReview)
    .patch(updateReview)
    .get(getReview)

module.exports = router;