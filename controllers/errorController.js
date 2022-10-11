const c = require("ansi-colors");
const AppError = require("../utils/appError.js");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // you threw this error
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // something else threw this error
    } else {
        console.error(c.bgRed.yellowBright("ERROR"), err);
        res.status(500).json({
            status: "error",
            message: "Something went wrong"
        });
    }

};

module.exports = (err, req, res, next) => { // 4 parameters is the signature for error handling MW
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Differentiate between prod and dev
    if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
    else if (process.env.NODE_ENV === 'production') {

        let knownErr = {...err};
        // let knownErr = Object.create(err);
        if (err.name === 'CastError') knownErr = handleCastErrorDB(knownErr);
        sendErrorProd(knownErr, res);
    }

    return next();
};