const express = require("express");

const {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
} = require("../controllers/restaurantController");

const {
  isVerifiedUser,
  isAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// ============================================================
// ADMIN RESTAURANT ROUTES
// ============================================================

// Create restaurant
router.post(
  "/",
  isVerifiedUser,
  isAdmin,
  createRestaurant
);

// Get logged-in Admin's restaurant
router.get(
  "/my",
  isVerifiedUser,
  isAdmin,
  getMyRestaurant
);

// Update logged-in Admin's restaurant
router.patch(
  "/my",
  isVerifiedUser,
  isAdmin,
  updateMyRestaurant
);

module.exports = router;