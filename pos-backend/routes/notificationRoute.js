const express =
  require("express");

const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendNotification,
} = require(
  "../controllers/notificationController"
);

const {
  isVerifiedUser,
  isSuperAdmin,
} = require(
  "../middlewares/tokenVerification"
);

const router =
  express.Router();

// ============================================================
// USER
// ============================================================

router.get(
  "/",
  isVerifiedUser,
  getMyNotifications
);

router.patch(
  "/read-all",
  isVerifiedUser,
  markAllNotificationsRead
);

router.patch(
  "/:id/read",
  isVerifiedUser,
  markNotificationRead
);

// ============================================================
// SUPER ADMIN
// ============================================================

router.post(
  "/send",
  isVerifiedUser,
  isSuperAdmin,
  sendNotification
);

module.exports =
  router;