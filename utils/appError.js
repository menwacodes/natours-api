class AppError extends (Error) {
    constructor(message, statusCode) {
        super(message); // message is the only parameter that Error accepts
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failure' : 'error';
        this.isOperational = true; // known and handled errors
        Error.captureStackTrace(this, this.constructor); // maintains stack trace
    }
}

module.exports = AppError;