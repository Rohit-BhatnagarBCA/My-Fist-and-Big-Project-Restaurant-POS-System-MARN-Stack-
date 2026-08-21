const express = require("express");

const {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,

  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
} = require("../controllers/restaurantController");

const {
  isVerifiedUser,
  isAdmin,
  isSuperAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// ============================================================
// RESTAURANT ADMIN
// ============================================================

router.post(
  "/",
  isVerifiedUser,
  isAdmin,
  createRestaurant
);

router.get(
  "/my",
  isVerifiedUser,
  isAdmin,
  getMyRestaurant
);

router.patch(
  "/my",
  isVerifiedUser,
  isAdmin,
  updateMyRestaurant
);

// ============================================================
// SUPER ADMIN
// ============================================================

router.get(
  "/admin/all",
  isVerifiedUser,
  isSuperAdmin,
  getAllRestaurants
);

router.get(
  "/admin/:id",
  isVerifiedUser,
  isSuperAdmin,
  getRestaurantById
);

router.patch(
  "/admin/:id/status",
  isVerifiedUser,
  isSuperAdmin,
  updateRestaurantStatus
);

module.exports = router;