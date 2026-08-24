const express = require("express");

const {
  addTable,
  getTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");

const {
  isVerifiedUser,
  isAdmin,
} = require("../middlewares/tokenVerification");

const router =
  express.Router();

// Everyone in the restaurant can VIEW tables.
router
  .route("/")
  .get(
    isVerifiedUser,
    getTables
  );

// Only Admin can create tables.
router
  .route("/")
  .post(
    isVerifiedUser,
    isAdmin,
    addTable
  );

// Order flow uses updateTable for booking/releasing a table,
// so this endpoint stays authenticated for staff.
// Restaurant ownership is enforced inside controller.
router
  .route("/:id")
  .put(
    isVerifiedUser,
    updateTable
  );

// Only Admin can delete.
router
  .route("/:id")
  .delete(
    isVerifiedUser,
    isAdmin,
    deleteTable
  );

module.exports =
  router;