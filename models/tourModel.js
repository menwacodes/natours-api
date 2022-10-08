/*
    SCHEMA
 */
const mongoose = require('mongoose')


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        trim: true  // removes white space around field
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"]
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: Number,
    summary: {
        type: String,
        required: [true, "A tour must have a description"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String, // name of the image file
        required: [true, "Cover image req'd"]
    },
    images: [String], // array of strings
    createdAt: {
        type: Date,
        default: new Date(), // mongoose will convert ms into a date
        select: false
    },
    startDates: [Date] // array of dates, mongodb will try to parse a string of a normal-looking date into an actual date
});

/*
    MODEL
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour