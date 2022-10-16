const mongoose = require('mongoose');

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

reviewSchema.pre(/^find/, function (next) {
    this
        .populate({
            path: 'tour',
            select: 'name'
        })
        .populate({
            path: 'user',
            select: 'name photo'
        });
    return next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;