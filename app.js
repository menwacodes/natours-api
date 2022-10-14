const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');


const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const tourRouter = require("./routes/tourRoutes.js");
const userRouter = require("./routes/userRoutes.js");

const app = express();

/*
    Helmet
 */
app.use(helmet());

/*
    Rate Limiter
    Automatically sends a 429 when limit hit
 */
const limiter = rateLimit({
    max: 100,
    windowMs: 3600 * 1000, // 1 hour
    message: "Too many requests, spammer"
});
app.use('/api', limiter);


// log only in dev
process.env.NODE_ENV === 'development' && app.use(morgan('dev'));

app.use(express.json({limit: '10kb'})); // body cannot be massively huge

app.use(express.static(`${__dirname}/public`)); // assumes a public directory in root

// add a property to the request body
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    return next();
});


/*
    ROUTING (also middleware)
 */

app.use('/api/v1/tours', tourRouter); // assigns a route to use the tourRouter (mounting a router on a route)
app.use('/api/v1/users', userRouter); // assigns a route to use the userRouter

// unhandled routes
// all http verbs
// if next receives an argument, Express always assumes this is an error, skipping all other middleware
app.all('*', (req, res, next) => next(new AppError(`Route ${req.originalUrl}, not handled yet`, 404)));

app.use(globalErrorHandler);

module.exports = app;