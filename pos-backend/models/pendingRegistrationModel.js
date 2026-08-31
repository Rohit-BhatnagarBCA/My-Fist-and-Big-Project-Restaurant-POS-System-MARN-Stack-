const mongoose = require("mongoose");

// ============================================================
// PENDING REGISTRATION
//
// Holds registration details temporarily until the email OTP
// is verified. Nothing is written to User/Restaurant until
// verification succeeds. This document auto-deletes itself
// after 15 minutes (TTL index) if never verified.
// ============================================================

const pendingRegistrationSchema =
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },

    restaurantName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Plaintext, short-lived only (max 15 min, TTL-deleted).
    // Hashed for real once the actual User document is created.
    password: {
      type: String,
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    otpExpiresAt: {
      type: Date,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // 15 minutes — Mongo TTL auto-delete
    },
  });

module.exports = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema
);