// everything starts here, none of this is express specific
const mongoose = require('mongoose');
/*
    Mongo authentication error error.message: "Authentication failed.", code: 8000, codeName: 'AtlasError'
 */

const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require("./app.js");
const c = require("ansi-colors");

const DB = process.env.DB_CONN.replace('<USERNAME>', process.env.DB_UN).replace('<PASSWORD>', process.env.DB_PW);

const mOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
};

const connect = async () => {
    try {
        await mongoose.connect(DB, mOptions);
        console.log(c.bgMagentaBright("Mongo Connection Open"));
    } catch (error) {
        console.error(error);
        console.log(c.bgRed.yellowBright(`Mongo Connection Error: ${error.message}`));
    }
};

connect();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(c.bgGreenBright(`Listening on http://localhost:${port}`)));

// Catch any unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(c.bgRed.yellowBright(`Unhandled Rejection --- ${err.name}: ${err.message}`));
    server.close(() => process.exit(1)); // graceful shutdown
});

// Uncaught Exceptions: errors in synchronous code
process.on('uncaughtException', err => {
    console.log(c.bgRed.yellowBright(`Uncaught Exception --- ${err.name}: ${err.message}`));
    console.error(err)
    process.exit(1) // because synchronous, nothing is waiting on it, should be at top of file
});
