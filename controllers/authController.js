const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError.js");
const {promisify} = require('util');

const signJWT = id => {
    const tokenOptions = {expiresIn: process.env.JWT_EXPIRES_IN};
    return jwt.sign({id}, process.env.JWT_SECRET, tokenOptions);
};

exports.signUp = catchAsync(async (req, res, next) => {
    const {name, email, password, passwordConfirm, passwordChangedAt} = req.body;
    const newUser = await User.create({name, email, password, passwordConfirm, passwordChangedAt});
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

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token
    let token;
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ? token = req.headers.authorization.split(" ").at(1)
        : token = undefined;

    if (!token) return next(new AppError("User not logged in", 401));

    // 2) Validate token
    /*
        promisify will take an async function (jwt.verify) and make it return a promise, allowing use of await
        the (token, process.env_JWT_SECRET) is calling the promisify(jwt.verify) function
        this is instead of using jwt.verify's third argument callback
     */
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const {id, iat} = decoded;

    // 3) Check if user still exists
    const jwtUser = await User.findById(id);
    if (!jwtUser) return next(new AppError("Bad User or Password", 401));

    // 4) Check if user changed pw after the token was issued (jwt stolen, to mitigate, valid user changes pw)
    // uses instance method
    // console.log(jwtUser.changedPasswordAfter(iat))
    if (jwtUser.changedPasswordAfter(iat)) return next(new AppError("Bad User or Password", 401));

    req.user = jwtUser;
    return next();
});