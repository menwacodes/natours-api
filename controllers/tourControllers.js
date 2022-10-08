const Tour = require('./../models/tourModel.js');

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
        // console.log('queryObj after clean: ', queryObj);

        // build filter object by excluding functional params
        const filterObj = {...queryObj};
        // console.log('filterObj before clean: ', filterObj)
        excludedFields.forEach(el => delete filterObj[el]);
        // console.log('filterObj after clean: ', filterObj)

        // query build and fork based on filter presence
        let query;

        // Check for Filters
        if (Object.keys(filterObj).length) {
            // look for gte, lte, etc
            // convert filterObj to string
            let queryString = JSON.stringify(filterObj);

            queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
            query = Tour.find(JSON.parse(queryString));

        } else {
            query = Tour.find();
        }

        //
        /*
            SORTING
            query string: sort=price,duration
            req.query: { sort: '-price,duration' }
            mongo: sort('price duration')
            --> replace comma with space, since it's one value, can use split to create an array with comma as delim, then make it a string again
            ternary the below
         */
        // if (queryObj.sort) {
        //     const sortBy = queryObj.sort.split(',').join(' ')
        //     query = query.sort(sortBy)
        // }

        queryObj.sort
            ? query.sort(queryObj.sort.split(',').join(' '))
            : query.sort('name');

        /*
            FIELD LIMITING
            - limits the number of fields in the return
            - mongo: query.select('name duration price')
                - a negative value in select excludes vs limits
         */
        queryObj.fields
            ? query.select(queryObj.fields.split(',').join(' '))
            : query.select('-__v');

        /*
            PAGINATION
            - should have default pagination
            - query = query.skip(2).limit(10)
            - limit is the number of results to return
            - skip is the amount of results that should be skipped before querying data
                - page=2,limit=50
                - results 1-10 are on page 1
                - results 11-20 are on page 2
                -> skip 10 results before you start querying
            - if page = p, limit = l
                - skip = (p-1) * l
         */
        const page = +req.query.page || 1; // defaults
        const limit = +req.query.limit || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Account for out-of-range page requests
        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            // if skipping documents leaves no more to query, it's out of range
            if (skip >= numTours) throw new Error("This page does not exist");
        }


        const tours = await query; // query execution

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

module.exports = {getAllTours, getOneTour, createTour, updateTour, deleteTour, aliasTopTours};