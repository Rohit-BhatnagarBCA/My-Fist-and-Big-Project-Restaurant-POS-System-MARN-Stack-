const mongoose = require("mongoose");

const subscriptionRequestSchema =
  new mongoose.Schema(
    {
      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
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

      paymentReference: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
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

      subscriptionExpiry: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "SubscriptionRequest",
    subscriptionRequestSchema
  );