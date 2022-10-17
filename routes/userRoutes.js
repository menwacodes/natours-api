const express = require("express");
const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe} = require("../controllers/userControllers.js");
const {signUp, login, forgotPassword, resetPassword, updatePassword, protect} = require("../controllers/authController.js");
const router = express.Router(); // creates a new router and saves into router

/*
    User Accessible Routes
 */
router
    .post('/signup', signUp);

router
    .post('/login', login)

router.post('/forgotPassword', forgotPassword) // receives email address
router.patch('/resetPassword/:token', resetPassword) // receives token and new pw
router.patch('/updateMyPassword', protect, updatePassword)

router.get('/me', protect, getMe, getUser)
router.patch('/updateMe', protect, updateMe)
router.delete('/deleteMe', protect, deleteMe)

/*
    Admin Only Routes
 */
router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;
