const express = require("express");

const {
  register,
  login,
  getUserData,
  logout,

  createStaff,
  getMyStaff,
  updateStaff,
  deleteStaff,

  getAllUsers,
  updateUserSubscription,
} = require("../controllers/userController");

const {
  isVerifiedUser,
  isAdmin,
  isSuperAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

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

// ============================================================
// CURRENT USER
// ============================================================

router.get(
  "/",
  isVerifiedUser,
  getUserData
);

// ============================================================
// RESTAURANT ADMIN — STAFF
// ============================================================

router.post(
  "/staff",
  isVerifiedUser,
  isAdmin,
  createStaff
);

router.get(
  "/staff",
  isVerifiedUser,
  isAdmin,
  getMyStaff
);

router.patch(
  "/staff/:id",
  isVerifiedUser,
  isAdmin,
  updateStaff
);

router.delete(
  "/staff/:id",
  isVerifiedUser,
  isAdmin,
  deleteStaff
);

// ============================================================
// SUPER ADMIN
// ============================================================

router.get(
  "/admin/users",
  isVerifiedUser,
  isSuperAdmin,
  getAllUsers
);

router.patch(
  "/admin/users/:id/subscription",
  isVerifiedUser,
  isSuperAdmin,
  updateUserSubscription
);

module.exports = router;