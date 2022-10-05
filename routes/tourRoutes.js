const express = require("express");

const router = express.Router() // creates a new router and saves into router, convention to name variable 'router'

const {getAllTours, getOneTour, createTour, updateTour, deleteTour} = require("../controllers/tourControllers.js");

router // specify sub route, if any and routing methods for the router
    .route('/')
    .get(getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getOneTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router
