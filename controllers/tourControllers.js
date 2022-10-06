const Tour = require('./../models/tourModel.js');

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

const createTour = async (req, res) => {
// if items come in on req.body that are not part of the schema, they get dropped on the floor
    try {
        const newTour = await Tour.create(req.body); // saves directly to db

        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    } catch (e) {
        console.error("An error occurred", e);
        res.status(400).json({
            status: "failure",
            message: e.code === 11000 ? "That title already exists" : e.message
        });
    }
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