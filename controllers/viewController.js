const Tour = require('../models/tourModel.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require("../utils/appError.js");

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get all the tour data from collection
    const tours = await Tour.find({});
    const context = {title: 'All Tours', tours};

    // 2) Build template

    // 3) Render template

    res.status(200).render('overview', context);
});

exports.getTour = catchAsync(async (req, res, next) => {
    const slug = req.params;
    const tour = await Tour.findOne(slug).populate({path: 'reviews', fields: 'review, rating, user'});
    if (!tour) next(new AppError(`No tour for ${slug}`, 404));

    const context = {tour};

    res.status(200).render('tour', context);
});