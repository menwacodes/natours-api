module.exports = (err, req, res, next) => { // 4 parameters is the signature for error handling MW
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
    return next();
};