const express = require("express");
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe
} = require("../controllers/userControllers.js");
const {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protect,
    authorize
} = require("../controllers/authController.js");
const router = express.Router(); // creates a new router and saves into router

/*
    Publicly Accessible Routes
 */
router
    .post('/signup', signUp);

router
    .post('/login', login);

router.post('/forgotPassword', forgotPassword); // receives email address
router.patch('/resetPassword/:token', resetPassword); // receives token and new pw

/*
    Protected Routes
    - MW parsed in order
    - Everything after router.use(protect) requires authentication
 */
router.use(protect);
router.patch('/updateMyPassword', updatePassword);

router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

/*
    Admin Only Routes
    - router.use(authorize('admin')); makes all routes, from this point, only available to admins
 */
router.use(authorize('admin'));
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
