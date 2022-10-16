/*
    SCHEMA
 */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator')

const tourSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "A tour must have a name"],
            trim: true,  // removes white space around field
            unique: true, // not a validator
            maxlength: [40, 'Name must be lte 40 characters'],
            minlength: [10, 'Name must be gte 10 characters'],
            // validate: [validator.isAlpha, 'Name must only be alpha']
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
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: "Difficulty must be: easy, medium, or difficult"
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be >=1'], // min/max also works on dates
            max: [5, 'Rating must be <=5>'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"]
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // 'this' points to current document which is needed to compare to price
                    // if you don't need the current document, you can use an arrow function
                    // the function has access to the value provided by the client
                    // in this case, the priceDiscount
                    return val < this.price;
                },
                message: `Price discount of ({VALUE}) must be < price`
                // message: props => `${props.value}`
            }
        },
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
        },
        startLocation: {
            // GeoJSON for geospatial data (type and coordinates are required)
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number], // lng, lat format
            address: String,
            description: String
        },
        locations: [
            // embedded documents, an array of objects
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }

        ],
        // child referencing
        guides: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User' // does not require import of User Model
        }]
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

// EMBEDDING
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id)); // the result of map is an array of promises
//     this.guides = await Promise.all(guidesPromises); // Promise.all will run all promises in the array
//     return next();
// });

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

tourSchema.pre(/^find/, function (next) {
    this.populate({
            path: 'guides',
            select: '-__v -passwordChangedAt'
        }
    );
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
    });
    console.log(this.pipeline());
    return next();
});

/*
    MODEL
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;