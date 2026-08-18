const express = require("express");

const {
  register,
  login,
  getUserData,
  logout,
  getAllUsers,
  updateUserSubscription,
} = require("../controllers/userController");

const {
  isVerifiedUser,
  isSuperAdmin,
} = require("../middlewares/tokenVerification");

const router = express.Router();

// Authentication
router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.post(
  "/logout",
  isVerifiedUser,
  logout
);

// Current User
router.get(
  "/",
  isVerifiedUser,
  getUserData
);

// Super Admin - all users
router.get(
  "/admin/users",
  isVerifiedUser,
  isSuperAdmin,
  getAllUsers
);

// Super Admin - manual subscription
router.patch(
  "/admin/users/:id/subscription",
  isVerifiedUser,
  isSuperAdmin,
  updateUserSubscription
);

module.exports = router;