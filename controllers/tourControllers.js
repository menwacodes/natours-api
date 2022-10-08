const Tour = require('./../models/tourModel.js');
const APIFeatures = require("../utils/apiFeatures.js");

const aliasTopTours = async (req, res, next) => {
    // manipulate the request object before getAllTours has it
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    return next();
};

const getAllTours = async (req, res) => {
    try {
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
    } catch (e) {
        console.error(e);
        res.status(500).json({
            status: "failure",
            message: e.message
        });
    }
};

const getOneTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id); // because this is a param named id on the route
        // findById is a shorthand helper for .findOne({_id: req.params.id})
        res.status(200).json({
            status: "success",
            data: {tour}
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: "failure",
            message: `No tour with id ${req.params.id}`
        });
    }
};

const createTour = async (req, res) => {
// if items come in on req.body that are not part of the schema, they get dropped on the floor
    try {
        const newTour = await Tour.create(req.body); // saves directly to db

        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    } catch (e) {
        console.error("An error occurred", e);
        res.status(400).json({
            status: "failure",
            message: e.code === 11000 ? "That title already exists" : e.message
        });
    }
};

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // the new, updated document is what is returned
            runValidators: true // ensures any created validators are run on the passed-in data
        });
        res.status(200).json({
            status: "success",
            data: {tour}
        });
    } catch (e) {
        console.error("An error occurred", e);
        res.status(400).json({
            status: "failure",
            message: e
        });
    }
};

const deleteTour = async (req, res) => {
    const id = req.params.id;
    try {
        await Tour.findByIdAndDelete(id);
        res.status(204).json({
            status: "success",
            data: {
                tour: null,
                message: `Tour ${id} was deleted`
            }
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({
            status: "failure",
            message: `No Tour with id: ${id}`
        });
    }
};

const getTourStats = async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failure",
            message: error
        });
    }
};

const getMonthlyPlan = async (req, res) => {
    try {
        const year = +req.params.year;
        console.log(typeof year);
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failure",
            message: error
        });
    }
};

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