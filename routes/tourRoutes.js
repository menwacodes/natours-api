const express = require("express");

const router = express.Router();

const {
    getAllTours,
    getOneTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
} = require("../controllers/tourControllers.js");
const {protect, authorize} = require("../controllers/authController.js");

router
    .route('/tour-stats')
    .get(getTourStats)

router
    .route('/monthly-plan/:year')
    .get(getMonthlyPlan)

// vanity route to pre-fill fields in query string
// needs middleware before running the getAllTours handler
router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router
    .route('/')
    .get(protect, getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getOneTour)
    .patch(updateTour)
    .delete(protect, authorize('admin', 'lead-guide'), deleteTour);

module.exports = router;
