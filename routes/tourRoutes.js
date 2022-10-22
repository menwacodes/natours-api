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
    getMonthlyPlan,
    getToursWithin, getDistances
} = require("../controllers/tourControllers.js");
const {protect, authorize} = require("../controllers/authController.js");
const reviewRouter = require('./reviewRoutes.js');

router.use('/:tourId/reviews', reviewRouter); // redirect tour router for given segment

router
    .route('/tour-stats')
    .get(getTourStats);

router
    .route('/monthly-plan/:year')
    .get(protect, authorize('admin', 'lead-guide', 'guide'),getMonthlyPlan);

// vanity route to pre-fill fields in query string
// needs middleware before running the getAllTours handler
router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

/*
    GEOSPATIAL
 */
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);

router
    .route('/distances/:latlng/unit/:unit')
    .get(getDistances)

router
    .route('/')
    .get(getAllTours)
    .post(protect, authorize('admin', 'lead-guide'), createTour);

router
    .route('/:id')
    .get(getOneTour)
    .patch(protect, authorize('admin', 'lead-guide'), updateTour)
    .delete(protect, authorize('admin', 'lead-guide'), deleteTour);

module.exports = router;
