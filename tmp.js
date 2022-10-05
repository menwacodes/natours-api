const mongoose = require('mongoose');

const {Schema, model} = mongoose;

const tourSchema = new Schema({
    name: {
        type: String,
        required: true
    },

});



const Tour = model('Tour', tourSchema);

module.exports = Tour;