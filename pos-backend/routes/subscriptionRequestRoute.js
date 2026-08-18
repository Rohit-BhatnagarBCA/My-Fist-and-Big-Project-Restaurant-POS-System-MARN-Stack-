const express = require("express");
const router = express.Router();

const {
  createSubscriptionRequest,
  getMySubscriptionRequests,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
} = require("../controllers/subscriptionRequestController");

const { isVerifiedUser } = require("../middlewares/tokenVerification");

// User
router.post("/", isVerifiedUser, createSubscriptionRequest);

router.get(
  "/my",
  isVerifiedUser,
  getMySubscriptionRequests
);

// Admin
router.get(
  "/all",
  isVerifiedUser,
  getAllSubscriptionRequests
);

router.patch(
  "/:id/review",
  isVerifiedUser,
  reviewSubscriptionRequest
);

module.exports = router;