const express = require("express");

const {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,

  getMyTax,
  updateMyTax,
} = require("../controllers/restaurantController");

const {
  isVerifiedUser,
  isSuperAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// ======================================================
// MY RESTAURANT
// ======================================================

router.post(
  "/",
  isVerifiedUser,
  createRestaurant
);

router.get(
  "/my",
  isVerifiedUser,
  getMyRestaurant
);

router.patch(
  "/my",
  isVerifiedUser,
  updateMyRestaurant
);

// ======================================================
// TAX
// ======================================================

router.get(
  "/my/tax",
  isVerifiedUser,
  getMyTax
);

router.patch(
  "/my/tax",
  isVerifiedUser,
  updateMyTax
);

// ======================================================
// SUPER ADMIN
// ======================================================

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