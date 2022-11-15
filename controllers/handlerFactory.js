const catchAsync = require("../utils/catchAsync.js");
// const Tour = require("../models/tourModel.js");
const AppError = require("../utils/appError.js");
const APIFeatures = require("../utils/apiFeatures.js");

// const deleteTour = catchAsync(async (req, res, next) => {
//     const id = req.params.id;
//     const tour = await Tour.findByIdAndDelete(id);
//     if (!tour) return next(new AppError(`No tour with id ${req.params.id}`, 404));
//
//     res.status(204).json({
//         status: "success",
//         data: {
//             tour: null,
//             message: `Tour ${id} was deleted`
//         }
//     });
// });

/*
    Create a function that looks like the deleteTour and can be used by other controllers
    - Model needs to get passed in to generalize the function
    - All the params need to share the same name, or you need to build up a large ||
 */

const deleteOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const document = await Model.findByIdAndDelete(id);
    if (!document) return next(new AppError(`No document with id ${req.params.id}`, 404));

    res.status(204).json({
        status: "success",
        data: {
            document: null,
            message: `Tour ${id} was deleted`
        }
    });
});

const updateOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // the new, updated document is what is returned
        runValidators: true // ensures any created validators are run on the passed-in data
    });
    if (!document) return next(new AppError(`No document with id ${req.params.id}`, 404));
    res.status(200).json({
        status: "success",
        data: {data: document}
    });
});

const createOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body); // saves directly to db
    res.status(201).json({
        status: "success",
        data: {data: document}
    });
});

const getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    if (!document) return next(new AppError(`No document with id ${req.params.id}`, 404));

    res.status(200).json({
        status: "success",
        data: {data: document}
    });
});

const getAll = Model => catchAsync(async (req, res, next) => {
    // allow for nested GET reviews on Tour (hack)
    let filterObj = {};
    if (req.params.tourId) filterObj = {tour: req.params.tourId};
    const queryObj = {...req.query};
    /*
    This stuff to get rolled into the query mw for get all users so admins can see soft-deletes
    // const userRole = User.findById(req.params.id).select('role')
    // queryObj.requestorRole = userRole
    // in APIFeatures, assign this.query.role = this.query.requestorRole
    // in model query mw, should be able to pull out of 'this'
    // in userRoutes, requires .get(protect,getMe,getAllUsers) as the MW to put user data onto request
     */


    const excludedFields = ['page', 'sort', 'limit', 'fields']; // array to exclude from filter
    const allowableFields = ['duration', 'difficulty', 'price', 'rating', 'role'].concat(excludedFields); // array to scrape garbage off query string

    Object.keys(queryObj).forEach(el => {
        if (!(allowableFields.includes(el))) {
            delete queryObj[el];
        }
    });

    const features = new APIFeatures(Model.find(filterObj), queryObj)
        .filter(excludedFields)
        .sort()
        .limitFields()
        .paginate();

    const documents = await features.query; // query execution
    // const documents = await features.query.explain(); // query explain

    res.status(200).json({
        status: "success",
        results: documents.length,
        data: {data: documents}
    });
});

module.exports = {deleteOne, updateOne, createOne, getOne, getAll};

