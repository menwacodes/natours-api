const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError.js");

const signJWT = id => {
    const tokenOptions = {expiresIn: process.env.JWT_EXPIRES_IN};
    return jwt.sign({id}, process.env.JWT_SECRET, tokenOptions);
};

exports.signUp = catchAsync(async (req, res, next) => {
    const {name, email, password, passwordConfirm} = req.body;
    const newUser = await User.create({name, email, password, passwordConfirm});
    newUser.password = undefined;

    // log in created user
    // const tokenOptions = {expiresIn: process.env.JWT_EXPIRES_IN};
    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, tokenOptions);
    const token = signJWT(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // See if email exists on the request
    if (!email || !password) return next(new AppError("Please provide both email and password", 400));

    // Check if user is in the system and password is correct
    const invalidMsg = "Incorrect email or password";
    const errNum = 401;

    const user = await User.findOne({email}).select('+password'); // required as password by default is hidden from select
    if (!user) return next(new AppError(invalidMsg, errNum));

    const correctPW = await user.correctPassword(password, user.password); // correctPassword is async
    if (!correctPW) return next(new AppError(invalidMsg, errNum));

    // if (!user || !(await user.correctPassword(password, user.password))) return next(new AppError(invalidMsg, errNum))

    // Send back JWT
    const token = signJWT(user._id);

    res.status(200).json({
        status: "success",
        token
    });
});
