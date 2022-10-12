const c = require("ansi-colors");
const AppError = require("../utils/appError.js");

const handleJWTError = () => new AppError("Invalid Token. Please login again.", 401)

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateKeyError = err => {
    const message = `Duplicate Key Error: ${err.keyValue.name}.`;
    return new AppError(message, 400);
};

const handleValidationError = err => {
    const errors = Object.values(err.errors).map(el => el["message"]).join('. ');
    const message = `Invalid input data: ${errors}.`;
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
        // let knownErr = {...err};
        let knownErr = Object.create(err);
        if (err.name === 'CastError') knownErr = handleCastErrorDB(knownErr);

        // duplicate key error
        if (err.code === 11000) knownErr = handleDuplicateKeyError(knownErr);

        // validation error
        if (err.name === "ValidationError") knownErr = handleValidationError(knownErr);


        // JSON Web Token error
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") knownErr = handleJWTError(knownErr)

        // send error
        sendErrorProd(knownErr, res);
    }

    return next();
};