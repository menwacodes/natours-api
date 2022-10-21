const mongoose = require('mongoose');
const Tour = require("./tourModel.js");

const {Schema} = mongoose;

const reviewSchema = new Schema({
        review: {
            type: String,
            required: [true, 'Review cannot be empty']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        // parent referencing
        tour: {
            type: Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a Tour']
        },
        user: {
            type: Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a User']
        }
    },
    {
        toJSON: {virtuals: true}, // whenever the output is provided as JSON, provide the virtuals
        toObject: {virtuals: true} // whenever the output is provided as an object, provide the virtuals
    }
);

reviewSchema.index({tour: 1, user: 1}, {unique: true}) // one user can only leave one review

reviewSchema.pre(/^find/, function (next) {
    this
        .populate({
            path: 'user',
            select: 'name photo'
        });
    return next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    /*
        Aggregation pipeline
        - this points to current model in static methods
        - pipeline takes array of all stages of the aggregation
     */
    const stats = await this.aggregate([
        {$match: {tour: tourId}}, // select only reviews for a given tour
        {
            $group: {
                _id: '$tour',
                nRatings: {$sum: 1}, // add 1 to nRating for each review
                avgRating: {$avg: '$rating'}
            }
        }
    ]);

    const [data] = stats;
    data // account for last delete of a rating
        ? await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: data.nRatings,
            ratingsAverage: data.avgRating
        })
        : await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
};

/*
    - this points to the document being saved in query middleware
    - calcAverageRatings static is available on the model: Review.calcAverageRatings
        - Review doesn't exist until the model is created from the schema
        - The query MW is on the schema and needs to be put in place for the model
        - To get the model before declaration, use this.constructor
            - this is the document, the Model does the constructing
 */
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});

/*
    findByIdAnd something calls findOneAnd something with the id
 */
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     // 'this' is current query
//     this.r = await this.findOne(); // executes query which provides a document and saves it onto the current document
//     next();
// });

/*
    Cannot use await this.findOne() in the post as the query is already executed and doesn't exist
 */
// reviewSchema.post(/^findOneAnd/, async function () {
//     await this.r.constructor.calcAverageRatings(this.r.tour);
// });

reviewSchema.post(/^findOneAnd/, async function (doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;