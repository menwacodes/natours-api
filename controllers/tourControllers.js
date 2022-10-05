const fs = require("fs");

const tourRoutes = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)); // fs.readFileSync returns buffer

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
    const id = +req.params.id;
    const foundTour = tourRoutes.find(tour => tour.id === id); // req.params always has strings

    // guard
    if (!foundTour) return res.status(404).json({status: "failure", message: `Could not find tour ${id}`});

    res.status(200).json({
        status: "success",
        data: {tour: foundTour}
    });
};

const createTour = (req, res) => {

    const newId = tourRoutes.at(-1).id + 1;
    const newTour = Object.assign({id: newId}, req.body);

    // push newTour into tour array
    tourRoutes.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
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
    // get id
    const id = +req.params.id;
    const foundTour = tourRoutes.find(tour => tour.id === id);
    if (!foundTour) return res.status(404).json({status: "failure", message: `Tour ${id} could not be found`});
    res.status(204).json({
        status: "success",
        data: {
            tour: null,
            message: `Tour ${id} was deleted`
        }
    });
};

module.exports = {getAllTours, getOneTour, createTour, updateTour, deleteTour}