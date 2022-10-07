const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel.js');


const dotenv = require('dotenv');
dotenv.config({path: '../../config.env'});

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


// READ in JSON File
const tours = JSON.parse(fs.readFileSync('./tours-simple.json', "utf-8"));

const importData = async () => {
    try {
        await Tour.create(tours); // create can accept an array of documents as well as one document
        console.log('Data Successfully Loaded');
    } catch (error) {
        console.error(error);
    }
    process.exit(); // kills process
};

// DELETE all data from Collection
const deleteData = async () => {
    try {
        await Tour.deleteMany(); // deletes everything
        console.log('Data Successfully Deleted');
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

process.argv[2] === '--import' && importData();
process.argv[2] === '--delete' && deleteData();
