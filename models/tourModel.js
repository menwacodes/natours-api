/*
    SCHEMA
 */
const mongoose = require('mongoose');
const slugify = require('slugify');


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
        startDates: [Date], // array of dates, mongodb will try to parse a string of a normal-looking date into an actual date
        slug: String,
        secretTour: {
            type: Boolean,
            default: false
        }
    },
    {
        toJSON: {virtuals: true}, // whenever the output is provided as JSON, provide the virtuals
        toObject: {virtuals: true} // whenever the output is provided as an object, provide the virtuals
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7; // 'this' points to the current document
});

// called before a document is saved to the database (only on .save() and .create(), (NOT on .insertMany()))
// pre-save MW gets access to next
tourSchema.pre('save', function (next) {
    // create slug before saving
    this.slug = slugify(this.name, {lower: true});
    return next();
});

// executed after the pre-middleware has been completed
// tourSchema.post('save', function(justSavedDoc, next){
//     console.log(justSavedDoc);
//     return next();
// });
//
// tourSchema.pre('save', function(next){
//     console.log('Will save doc...')
//     return next();
// })

/*
    Query Middleware
    - 'find' makes this query mw vs 'save' makes document mw
    - 'this' points at the current query object
    - use case: Can have secret tours that shouldn't appear in output
        - create a 'secret tour' field and query for those that are not secret
 */

// tourSchema.pre(['find','findOne'], function (next) {
tourSchema.pre(/^find/, function (next) { // regExp for all the commands that start with find instead of an array
    this.find({secretTour: {$ne: true}});

    // add a clock
    this.start = Date.now();
    return next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`The query took ${Date.now() - this.start}ms`);
    // access to all documents returned by the query
    // console.log(docs);
    return next();
});

/*
    Aggregation Middleware
    - can add hooks before or after an aggregation
    - with the 'secret tours', the aggregation is going to count these
    - 'this' points to the current aggregation object
    - to filter out the secret tours, add another match to the beginning of the pipeline array
 */

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        '$match': {secretTour: {$ne: true}}
    })
    console.log(this.pipeline());
    return next();
});

/*
    MODEL
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;