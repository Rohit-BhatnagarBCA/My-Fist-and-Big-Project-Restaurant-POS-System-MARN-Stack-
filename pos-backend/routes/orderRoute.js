const express = require("express");
const {
  addOrder,
  addItemsToOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteCompletedOrders,
} = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const { isAdmin } = require("../middlewares/roleVerification");
const router = express.Router();

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);

// NOTE: this must come BEFORE "/:id" below, otherwise Express will treat
// "completed" as an :id value and this route will never be reached.
router.route("/completed").delete(isVerifiedUser, isAdmin, deleteCompletedOrders);

router.route("/:id/items").put(isVerifiedUser, addItemsToOrder);

router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);

module.exports = router;