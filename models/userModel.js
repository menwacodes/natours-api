const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {randomBytes, createHash} = require('crypto');
const req = require("express/lib/request.js"); // built-in node module

const {Schema} = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true, // transforms entry to lowercase
        validate: [validator.isEmail, "A valid email is required"]
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 5,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Password confirm is required"],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    // encrypt pw when it changes or is created
    if (!this.isModified('password')) return next();

    // npm i bcryptjs
    this.password = await bcrypt.hash(this.password, 12); // 12 is the CPU cost, higher = harder

    this.passwordConfirm = undefined;

    return next();
});

// update password changed at field
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && !this.isNew) this.passwordChangedAt = Date.now() - 1000; // accounts for timing difference between JWT issue and password date
    return next();
});

// query mw
userSchema.pre(/^find/, function (next) {
    this.find({active: true});
    return next();
});

// instance method available on all documents within this collection
// bcrypt compare is asynchronous
userSchema.methods.correctPassword = async (sentPW, dbPW) => {
    return await bcrypt.compare(sentPW, dbPW);
};

userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = this.passwordChangedAt.getTime() / 1000; // jwt iat is in seconds
        return changedTimeStamp > jwtIssuedAt; // is the password changed after token issued
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = randomBytes(32).toString('hex'); // convert to hex
    this.passwordResetToken = createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    console.log({resetToken}, this.passwordResetToken);
    console.log(this.passwordResetExpires);
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;