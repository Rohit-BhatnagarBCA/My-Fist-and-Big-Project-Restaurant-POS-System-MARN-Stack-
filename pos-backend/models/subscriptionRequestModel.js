const mongoose = require("mongoose");

const subscriptionRequestSchema =
  new mongoose.Schema(
    {
      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
      },

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      plan: {
        type: String,
        enum: ["Basic", "Pro"],
        required: true,
      },

      duration: {
        type: String,
        enum: [
          "Monthly",
          "4-Month",
          "Yearly",
        ],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 1,
      },

      // Base64 data URI of the payment screenshot the admin
      // uploaded (QR/UPI confirmation). Stored directly in
      // Mongo rather than on disk, since Render's filesystem
      // is wiped on every redeploy/restart.
      paymentScreenshot: {
        type: String,
        required: true,
      },

      paymentNote: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Approved",
          "Rejected",
        ],
        default: "Pending",
        index: true,
      },

      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      subscriptionStart: {
        type: Date,
        default: null,
      },

      subscriptionExpiry: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

subscriptionRequestSchema.index({
  restaurantId: 1,
  status: 1,
});

// ============================================================
// HARD LOCK — at most one Pending request per restaurant.
//
// The controller already checks this before creating a
// request, but that check-then-create is not atomic: two
// requests fired at nearly the same time (e.g. a script
// hammering the endpoint) could both pass the check before
// either one finishes writing. This partial unique index
// makes MongoDB itself the final gatekeeper — it will
// reject any second "Pending" document for the same
// restaurant outright, no matter how many requests race in.
// ============================================================

subscriptionRequestSchema.index(
  { restaurantId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "Pending",
    },
  }
);

module.exports =
  mongoose.model(
    "SubscriptionRequest",
    subscriptionRequestSchema
  );