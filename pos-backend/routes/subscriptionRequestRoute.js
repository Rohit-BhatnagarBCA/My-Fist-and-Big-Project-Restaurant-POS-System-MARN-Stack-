const express = require("express");

const {
  createSubscriptionRequest,
  getMySubscriptionRequests,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
} = require("../controllers/subscriptionRequestController");

const {
  isVerifiedUser,
  isSuperAdmin,
} = require("../middlewares/tokenVerification");

const router = express.Router();

// ============================================================
// USER
// ============================================================

router.post(
  "/",
  isVerifiedUser,
  createSubscriptionRequest
);

router.get(
  "/my",
  isVerifiedUser,
  getMySubscriptionRequests
);

// ============================================================
// SUPER ADMIN
// ============================================================

router.get(
  "/all",
  isVerifiedUser,
  isSuperAdmin,
  getAllSubscriptionRequests
);

router.patch(
  "/:id/review",
  isVerifiedUser,
  isSuperAdmin,
  reviewSubscriptionRequest
);

module.exports = router;