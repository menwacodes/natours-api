const User = require("../models/userModel.js");
const catchAsync = require('../utils/catchAsync.js');
const AppError = require("../utils/appError.js");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {results: users.length, users}
    });
});

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const updateMe = catchAsync(async (req, res, next) => {
    // 1) Create an error if the user tries to update password
    if (req.body.password || req.body.passwordConfirm) return next(new AppError("This route not for PW", 400));

    // 2) Update user document
    // console.log(Object.keys(req.body))
    /*
        findByIdAndUpdate as we don't need to do interim stuff like validating the provided pw
     */

    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});


    return res.status(200).json({
        status: "success",
        data: {user: updatedUser}
    });
});

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    return res.status(204).json({
        status: "success",
        data: null
    });
});

module.exports = {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe};