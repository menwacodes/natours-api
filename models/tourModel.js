/*
    SCHEMA
 */
const mongoose = require('mongoose')


const tourSchema = new mongoose.Schema({
    name: { // schema type options, not mandatory but adds functionality
        type: String,
        required: [true, "A tour must have a name"]
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    }
});

/*
    MODEL
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour