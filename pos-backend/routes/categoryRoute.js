const express = require("express");

const {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");

const {
  isVerifiedUser,
  isAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// View categories — restaurant staff allowed.
router
  .route("/")
  .get(
    isVerifiedUser,
    getCategories
  );

// Category management — Admin only.
router
  .route("/")
  .post(
    isVerifiedUser,
    isAdmin,
    addCategory
  );

router
  .route("/:id")
  .put(
    isVerifiedUser,
    isAdmin,
    updateCategory
  );

router
  .route("/:id")
  .delete(
    isVerifiedUser,
    isAdmin,
    deleteCategory
  );

module.exports =
  router;