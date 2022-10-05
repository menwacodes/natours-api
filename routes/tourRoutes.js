const express = require("express");

const router = express.Router();

const {
    getAllTours,
    getOneTour,
    createTour,
    updateTour,
    deleteTour,
    checkID,
    checkBody
} = require("../controllers/tourControllers.js");

router.param('id', checkID);

router
    .route('/')
    .get(getAllTours)
    .post(checkBody, createTour);

router
    .route('/:id')
    .get(getOneTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;
