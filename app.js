const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const tourRouter = require("./routes/tourRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const reviewRouter = require("./routes/reviewRoutes.js");
const path = require("path");

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // assumes a public directory in root

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

app.use(express.json({limit: '10kb'})); // ensures body cannot be massively huge

// Data sanitization - removes $, ., etc
app.use(mongoSanitize());

// XSS - removes malicious HTML code by converting < to &lt;
app.use(xss());

// parameter pollution - removes duplicate parameters in url string
app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));


// add a property to the request body
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    return next();
});


/*
    ROUTING (also middleware)
 */

// template
app.get('/', (req, res) => {
    const context = {tour: "The Forest Hiker", user: "Homer"};
    res.status(200).render('base', context);
});
app.get('/overview', (req, res) => {
    const context = {title: "All Tours"};
    res.status(200).render('overview', context);
});
app.get('/tour', (req, res) => {
    const context = {title: "Forest Hiker"};
    res.status(200).render('tour', context);
});

app.use('/api/v1/tours', tourRouter); // assigns a route to use the tourRouter (mounting a router on a route)
app.use('/api/v1/users', userRouter); // assigns a route to use the userRouter
app.use('/api/v1/reviews', reviewRouter);

// unhandled routes
// all http verbs
// if next receives an argument, Express always assumes this is an error, skipping all other middleware
app.all('*', (req, res, next) => next(new AppError(`Route ${req.originalUrl}, not handled yet`, 404)));

app.use(globalErrorHandler);

module.exports = app;