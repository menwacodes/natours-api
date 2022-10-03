const fs = require("fs");
const express = require('express');
const c = require('ansi-colors');

/* START: Express set up */
const app = express();
const port = 3000;

app.use(express.json()); // app.use does stuff on each request, this particular middleware puts the data from the body onto the reqeust

// get all the tours at top level
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)); // fs.readFileSync returns buffer

// tours, /v1/ allows breaking changes in /v2/ without impacting existing users
app.get('/api/v1/tours', (req, res) => {
    // send back all the tours
    res.status(200).json({
        status: "success",
        results: tours.length, // let client know how many results when have > 1
        data: {
            tours // matches endpoint
        }
    });
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.listen(port, () => console.log(c.bgGreenBright(`Listening on http://localhost:${port}`)));
