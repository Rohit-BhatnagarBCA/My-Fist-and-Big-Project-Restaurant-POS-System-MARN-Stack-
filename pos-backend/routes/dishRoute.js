const express = require("express");

const {
  addDish,
  getDishes,
  updateDish,
  updateDishStock,
  deleteDish,
} = require("../controllers/dishController");

const {
  isVerifiedUser,
  isAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// ============================================================
// GET DISHES
// Admin / Waiter / Kitchen can view.
// ============================================================

router
  .route("/")
  .get(
    isVerifiedUser,
    getDishes
  );

// ============================================================
// ADD DISH
// ADMIN ONLY
// ============================================================

router
  .route("/")
  .post(
    isVerifiedUser,
    isAdmin,
    addDish
  );

// ============================================================
// KITCHEN STOCK UPDATE
//
// IMPORTANT:
// This route must come BEFORE "/:id".
// ============================================================

router
  .route("/:id/stock")
  .patch(
    isVerifiedUser,
    updateDishStock
  );

// ============================================================
// FULL DISH UPDATE
// ADMIN ONLY
// ============================================================

router
  .route("/:id")
  .put(
    isVerifiedUser,
    isAdmin,
    updateDish
  );

// ============================================================
// DELETE DISH
// ADMIN ONLY
// ============================================================

router
  .route("/:id")
  .delete(
    isVerifiedUser,
    isAdmin,
    deleteDish
  );

module.exports =
  router;