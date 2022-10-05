const fs = require("fs");
const express = require('express');
const morgan = require('morgan');

const c = require('ansi-colors');

const app = express();
const port = 3000;

/*
    MIDDLEWARE
 */
app.use(morgan('dev'));

app.use(express.json()); // app.use does stuff on each request, this particular middleware puts the data from the body onto the reqeust

// add a property to the request body
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    return next();
});


// get all the tours at top level
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)); // fs.readFileSync returns buffer

/*
    Route Handlers
 */
// refactored get
const getAllTours = (req, res) => {
    // send back all the tours
    res.status(200).json({
        status: "success",
        results: tours.length, // let client know how many results when have > 1
        data: {
            tours // matches endpoint
        }
    });
};

const getOneTour = (req, res) => {
    const id = +req.params.id;
    const foundTour = tours.find(tour => tour.id === id); // req.params always has strings

    // guard
    if (!foundTour) return res.status(404).json({status: "failure", message: `Could not find tour ${id}`});

    res.status(200).json({
        status: "success",
        data: {tour: foundTour}
    });
};

const createTour = (req, res) => {
    // data NOT available on the request object, needs middleware app.use(express.json())

    const newId = tours.at(-1).id + 1; // Provide ID
    const newTour = Object.assign({id: newId}, req.body); // Create a new object with a single-entry object + the body

    // push newTour into tour array
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours), err => {
            res.status(201).json({
                status: "success",
                data: {
                    tour: newTour
                }
            });
        });
};

const updateTour = (req, res) => {
    // find the tour and update it (not here)
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
    const foundTour = tours.find(tour => tour.id === id);
    if (!foundTour) return res.status(404).json({status: "failure", message: `Tour ${id} could not be found`});
    res.status(204).json({
        status: "success",
        data: {
            tour: null,
            message: `Tour ${id} was deleted`
        }
    });
};

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

/*
    ROUTING
 */
app
    .route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour);

app
    .route('/api/v1/tours/:id')
    .get(getOneTour)
    .patch(updateTour)
    .delete(deleteTour);

// users
app
    .route('/api/v1/users')
    .get(getAllUsers)
    .post(createUser);

app
    .route('/api/v1/users/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

app.listen(port, () => console.log(c.bgGreenBright(`Listening on http://localhost:${port}`)));
