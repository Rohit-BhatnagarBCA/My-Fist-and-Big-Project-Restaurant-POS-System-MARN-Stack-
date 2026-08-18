const express = require("express");

const {
    register,
    login,
    getUserData,
    logout,
    getAllUsers,
    updateUserSubscription
} = require("../controllers/userController");

const {
    isVerifiedUser,
    isAdmin
} = require("../middlewares/tokenVerification");

const router = express.Router();


// ======================================================
// AUTHENTICATION
// ======================================================

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").post(
    isVerifiedUser,
    logout
);


// ======================================================
// CURRENT USER
// ======================================================

router.route("/").get(
    isVerifiedUser,
    getUserData
);


// ======================================================
// ADMIN — USER MANAGEMENT
// ======================================================

// Get all registered users
router.route("/admin/users").get(
    isVerifiedUser,
    isAdmin,
    getAllUsers
);


// Manually activate / deactivate subscription
router.route("/admin/users/:id/subscription").patch(
    isVerifiedUser,
    isAdmin,
    updateUserSubscription
);


module.exports = router;