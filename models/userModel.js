const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        minlength: 5
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

const User = mongoose.model('User', userSchema);

module.exports = User;