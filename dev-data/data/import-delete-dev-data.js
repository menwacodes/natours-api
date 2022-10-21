const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel.js');
const Review = require('./../../models/reviewModel.js');
const User = require('./../../models/userModel.js');


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
const tours = JSON.parse(fs.readFileSync('./tours.json', "utf-8"));
const users = JSON.parse(fs.readFileSync('./users.json', "utf-8"));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', "utf-8"));

const importData = async () => {
    try {
        await Tour.create(tours); // create can accept an array of documents as well as one document
        /*
            NOTE: Need to temporarily comment out all save MW, that's just for the API
            - for example, in the source data, if the passwords are already encrypted
         */
        await User.create(users, {validateBeforeSave: false}); // ensure we're not validating to model, imported data should already be valid
        await Review.create(reviews);
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
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Successfully Deleted');
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

process.argv[2] === '--import' && importData();
process.argv[2] === '--delete' && deleteData();
