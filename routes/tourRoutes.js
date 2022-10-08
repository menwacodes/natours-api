const express = require("express");

const router = express.Router();

const {
    getAllTours,
    getOneTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours
} = require("../controllers/tourControllers.js");

// vanity route to pre-fill fields in query string
// needs middleware before running the getAllTours handler
router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router
    .route('/')
    .get(getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getOneTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;
