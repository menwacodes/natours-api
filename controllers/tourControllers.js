const Tour = require('./../models/tourModel.js');

const getAllTours = async (req, res) => {
    try {
        const tours = await Tour.find();
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {tours}
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            status: "failure",
            message: e
        });
    }
};

const getOneTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id); // because this is a param named id on the route
        // findById is a shorthand helper for .findOne({_id: req.params.id})
        res.status(200).json({
            status: "success",
            data: {tour}
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: "failure",
            message: `No tour with id ${req.params.id}`
        });
    }
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

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // the new, updated document is what is returned
            runValidators: true // ensures any created validators are run on the passed-in data
        });
        res.status(200).json({
            status: "success",
            data: {tour}
        });
    } catch (e) {
        console.error("An error occurred", e);
        res.status(400).json({
            status: "failure",
            message: e
        });
    }
};

const deleteTour = async (req, res) => {
    const id = req.params.id;
    try {
        await Tour.findByIdAndDelete(id);
        res.status(204).json({
            status: "success",
            data: {
                tour: null,
                message: `Tour ${id} was deleted`
            }
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({
            status: "failure",
            message: `No Tour with id: ${id}`
        });
    }
};

module.exports = {getAllTours, getOneTour, createTour, updateTour, deleteTour};