const Tour = require('./../models/tourModel.js');
const APIFeatures = require("../utils/apiFeatures.js");
const catchAsync = require('../utils/catchAsync.js');
const factory = require('./handlerFactory.js');
const AppError = require("../utils/appError.js");


const aliasTopTours = async (req, res, next) => {
    // manipulate the request object before getAllTours has it
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    return next();
};

const getAllTours = factory.getAll(Tour);

const getOneTour = factory.getOne(Tour, {path: 'reviews'});

const createTour = factory.createOne(Tour);

const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);


const getTourStats = catchAsync(async (req, res, next) => {
    // array of object stages to define pipeline
    // Tour.aggregate returns an aggregate object like .find returns a query object
    const stats = await Tour.aggregate([
        {
            $match: {ratingsAverage: {$gte: 4.5}} // usually want to create a subset of documents to run through the pipeline but not mandatory
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'}, // group by fields (null - _id: null is the entire set, no group by), first thing in $group
                numTours: {$sum: 1}, // for each document that goes through the pipeline, 1 will be added to numTours
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'}, // you define this field name, $avg needs the db field name in quotes and prepended with $
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'},
            }
        },
        {
            $sort: {avgPrice: 1} // use the field names specified in the group above as the 'old names' are gone due to group, 1 === ASC, -1 === DESC
        } //,
        // {
        //     $match: {_id: {$ne: 'EASY'}} // repeating an operator, $ne === not equal, working within group, thus 'EASY' and not '$difficulty'
        // }
    ]);
    res.status(200).json({
        status: "success",
        data: {stats}
    });

    // try {
    //
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({
    //         status: "failure",
    //         message: error
    //     });
    // }
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' // deconstruct an array field from the input document and output one document for each el in the array
        },
        {
            $match: {
                startDates: { // looks like b/c array dates are strings
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: {$month: '$startDates'}, // pipeline date operator, returns month as number
                numTours: {$sum: 1},
                tours: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'} // name of the field : the value
        },
        {
            // remove the _id
            $project: {
                _id: 0 // hide
            }
        },
        {
            $sort: {numTours: -1}
        },
        {
            $limit: 12 // can be a lower number, works like .limit() in the query object
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {plan}
    });
    // try {
    //
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({
    //         status: "failure",
    //         message: error
    //     });
    // }
});

const getToursWithin = catchAsync(async (req, res, next) => {
    // get url params from '/tours-within/:distance/center/:latlng/unit/:unit' - latlng is lat,lng
    const {distance, latlng, unit} = req.params;
    // get coords
    const [lat, lng] = latlng.split(',');
    if (!lat || !lng) next(new AppError('Provide lat,lng', 400));

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // in radians (distance / radius of earth)

    const tours = await Tour.find({
        startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {data: tours}
    });
});

const getDistances = catchAsync(async (req, res, next) => {

    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if (!lat || !lng) next(new AppError('Provide lat,lng', 400));

    const distances = await Tour.aggregate([
        {
            // geoNear is always the first stage, and requires at least one field to be a geolocation index
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [+lng, +lat]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier // divide by 1000
            }
        },
        {
            $project: {
                distance: 1, name: 1, _id: 0
            }
        }
    ])

    return res.status(200).json({
        status: "success",
        data: {data: distances}
    });
});

module.exports = {
    getAllTours,
    getOneTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances
};