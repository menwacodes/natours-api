const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');

exports.signUp = catchAsync(async (req, res, next) => {
    const {name, email, password, passwordConfirm} = req.body;
    const newUser = await User.create({name, email, password, passwordConfirm});

    // log in created user
    const tokenOptions = {expiresIn: process.env.JWT_EXPIRES_IN};
    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, tokenOptions);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    });
});

