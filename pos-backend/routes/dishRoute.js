const express = require("express");

const {
  addDish,
  getDishes,
  updateDish,
  deleteDish,
} = require("../controllers/dishController");

const {
  isVerifiedUser,
  isAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// View dishes — staff allowed.
router
  .route("/")
  .get(
    isVerifiedUser,
    getDishes
  );

// Dish management — Admin only.
router
  .route("/")
  .post(
    isVerifiedUser,
    isAdmin,
    addDish
  );

router
  .route("/:id")
  .put(
    isVerifiedUser,
    isAdmin,
    updateDish
  );

router
  .route("/:id")
  .delete(
    isVerifiedUser,
    isAdmin,
    deleteDish
  );

module.exports =
  router;