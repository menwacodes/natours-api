const Tour = require('./../models/tourModel.js')

const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        // results: tourRoutes.length,
        // data: {
        //     tours: tourRoutes
        // }
    });
};

const getOneTour = (req, res) => {
    res.status(200).json({
        status: "success",
        // data: {tour: tourRoutes.find(tour => tour.id === +req.params.id)}
    });
};

const createTour = (req, res) => {

// res.status(201).json({
//                 status: "success",
//                 data: {
//                     tour: newTour
//                 }
//             });

};

const updateTour = (req, res) => {
    res.status(200).json({
        status: "success",
        data: {
            tour: "Here is your updated tour"
        }
    });
};

const deleteTour = (req, res) => {
    const id = +req.params.id;
    res.status(204).json({
        status: "success",
        data: {
            tour: null,
            message: `Tour ${id} was deleted`
        }
    });
};

module.exports = {getAllTours, getOneTour, createTour, updateTour, deleteTour};