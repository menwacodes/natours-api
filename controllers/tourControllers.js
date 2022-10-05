const fs = require("fs");

const tourRoutes = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)); // fs.readFileSync returns buffer

// param mw
const checkID = (req, res, next, val) => {
    console.log(`CheckID tourId: ${val}`);
    const id = +req.params.id;
    if (!tourRoutes.find(tour => tour.id === id)) return res.status(404).json({
        status: "failure",
        message: `Could not find tour ${id}`
    });

    return next();
};

const checkBody = (req, res, next) => {
    const reqFields = ["name", "price"];
    const valid = reqFields.every(field => field in req.body);
    if (!valid) return res.status(400).json({
        status: "failure",
        message: "Missing name or price"
    });
    return next();
};

const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tourRoutes.length,
        data: {
            tours: tourRoutes
        }
    });
};

const getOneTour = (req, res) => {
    res.status(200).json({
        status: "success",
        data: {tour: tourRoutes.find(tour => tour.id === +req.params.id)}
    });
};

const createTour = (req, res) => {
    const newId = tourRoutes.at(-1).id + 1;
    const newTour = Object.assign({id: newId}, req.body);

    // push newTour into tour array
    tourRoutes.push(newTour);
    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tourRoutes), err => {
            res.status(201).json({
                status: "success",
                data: {
                    tour: newTour
                }
            });
        });
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

module.exports = {getAllTours, getOneTour, createTour, updateTour, deleteTour, checkID, checkBody};