const express = require('express');
const morgan = require('morgan');

const tourRouter = require("./routes/tourRoutes.js");
const userRouter = require("./routes/userRoutes.js");

const app = express();


app.use(morgan('dev'));

app.use(express.json()); // app.use does stuff on each request, this particular middleware puts the data from the body onto the reqeust

// add a property to the request body
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    return next();
});


/*
    ROUTING (also middleware)
 */

app.use('/api/v1/tours', tourRouter) // assigns a route to use the tourRouter (mounting a router on a route)
app.use('/api/v1/users', userRouter) // assigns a route to use the userRouter

module.exports = app