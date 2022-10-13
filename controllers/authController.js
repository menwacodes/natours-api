const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError.js");
const {promisify} = require('util');
const sendEmail = require("../utils/email.js");
const {createHash} = require('crypto');

const signJWT = id => {
    const tokenOptions = {expiresIn: process.env.JWT_EXPIRES_IN};
    return jwt.sign({id}, process.env.JWT_SECRET, tokenOptions);
};

exports.signUp = catchAsync(async (req, res, next) => {
    const {name, email, password, passwordConfirm, passwordChangedAt, role} = req.body;
    const newUser = await User.create({name, email, password, passwordConfirm, passwordChangedAt, role});
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

/*
    To pass arguments into MW, create a wrapper function, where the inner gets access to the outer's variables
    - This is due to the closure
    - The .includes line uses the assignment of req.user = jwtUser which is MW running prior so the req.user object exists
        - the jwtUser started with a findById(jwt.id) and that user was stored onto the request
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new AppError("Not authorized for this action", 403));
        return next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) return next(new AppError("There is no user with that email address", 404));

    // 2)  Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false}); // deactivates validators

    // 3) Send the reset stuff to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}\nIf you did not make this request, oh well`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset Token (valid for 10 mins)',
            message
        });

        return res.status(200).json({
            status: 'success',
            message: 'Token sent to email on file'
        });
    } catch (error) {
        console.error(error);
        // reset both the token and expires property, then send to the error handler
        user.passwordResetToken = user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("There was an error sending the email, oh well", 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the future-expiring token
    // encrypt sent token and compare to database
    const userToken = createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: userToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    // 2) If token has not expired, and there is a user, set the new password
    if (!user) return next(new AppError("Token is invalid or has expired", 400));

    // 3) Update password management properties
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = user.passwordResetExpires = undefined;
    await user.save() // have the entire object, want validator to ensure passwords are the same

    // 4) Log the user in
    const token = signJWT(user._id);

    return res.status(200).json({
        status: "success",
        token
    });
});