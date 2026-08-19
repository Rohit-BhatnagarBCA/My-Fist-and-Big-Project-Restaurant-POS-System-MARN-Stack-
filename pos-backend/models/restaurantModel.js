const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "suspended",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    subscription: {
      plan: {
        type: String,
        enum: ["Basic", "Pro", null],
        default: null,
      },

      duration: {
        type: String,
        enum: [
          "Monthly",
          "4-Month",
          "Yearly",
          null,
        ],
        default: null,
      },

      amountPaid: {
        type: Number,
        default: 0,
        min: 0,
      },

      startDate: {
        type: Date,
        default: null,
      },

      expiryDate: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Restaurant",
  restaurantSchema
);