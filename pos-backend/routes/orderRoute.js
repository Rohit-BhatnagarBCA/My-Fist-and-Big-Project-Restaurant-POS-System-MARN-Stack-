const express = require("express");

const {
  addOrder,
  addItemsToOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteCompletedOrders,
} = require("../controllers/orderController");

const {
  isVerifiedUser,
  isAdmin,
} = require("../middlewares/tokenVerification");

const router = express.Router();

router
  .route("/")
  .post(
    isVerifiedUser,
    addOrder
  );

router
  .route("/")
  .get(
    isVerifiedUser,
    getOrders
  );

// Must be before "/:id"
router
  .route("/completed")
  .delete(
    isVerifiedUser,
    isAdmin,
    deleteCompletedOrders
  );

router
  .route("/:id/items")
  .put(
    isVerifiedUser,
    addItemsToOrder
  );

router
  .route("/:id")
  .get(
    isVerifiedUser,
    getOrderById
  );

router
  .route("/:id")
  .put(
    isVerifiedUser,
    updateOrder
  );

module.exports = router;