const Tour = require('./../models/tourModel.js');
const APIFeatures = require("../utils/apiFeatures.js");
const catchAsync = require('../utils/catchAsync.js');
const AppError = require("../utils/appError.js");


const aliasTopTours = async (req, res, next) => {
    // manipulate the request object before getAllTours has it
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    return next();
};

const getAllTours = catchAsync(async (req, res, next) => {

    const queryObj = {...req.query}; // shallow copy req.query (which is not nested)

    const excludedFields = ['page', 'sort', 'limit', 'fields']; // array to exclude from filter
    const allowableFields = ['duration', 'difficulty', 'price'].concat(excludedFields); // array to scrape garbage off query string

    // scrape any user-augmented params
    // console.log('queryObj before clean: ', queryObj);
    Object.keys(queryObj).forEach(el => {
        if (!(allowableFields.includes(el))) {
            delete queryObj[el];
        }
    });


    // .find() creates a query object, the class operates on that object
    // req.query is the query string
    // the class methods need to return 'this' in order to get back a query object so that chaining can occur
    const features = new APIFeatures(Tour.find(), queryObj)
        .filter(excludedFields)
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query; // query execution

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {tours}
    });
});

const getOneTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id); // because this is a param named id on the route
    // findById is a shorthand helper for .findOne({_id: req.params.id})

    if (!tour) return next(new AppError(`No tour with id ${req.params.id}`, 404));

    res.status(200).json({
        status: "success",
        data: {tour}
    });
});

const createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body); // saves directly to db

    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });

});

const updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // the new, updated document is what is returned
        runValidators: true // ensures any created validators are run on the passed-in data
    });
    if (!tour) return next(new AppError(`No tour with id ${req.params.id}`, 404));
    res.status(200).json({
        status: "success",
        data: {tour}
    });
});

const deleteTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);
    if (!tour) return next(new AppError(`No tour with id ${req.params.id}`, 404));

    res.status(204).json({
        status: "success",
        data: {
            tour: null,
            message: `Tour ${id} was deleted`
        }
    });
});

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

module.exports = {
    getAllTours,
    getOneTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
};