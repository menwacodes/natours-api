const express = require("express");
const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require("../controllers/userControllers.js");
const {signUp} = require("../controllers/authController.js");
const router = express.Router(); // creates a new router and saves into router

/*
    User Accessible Routes
 */
router
    .post('/signup', signUp);

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
