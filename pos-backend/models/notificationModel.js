const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      recipientUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },

      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        default: null,
        index: true,
      },

      senderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },

      type: {
        type: String,
        enum: [
          "announcement",
          "subscription",
          "warning",
          "system",
        ],
        default: "announcement",
      },

      isRead: {
        type: Boolean,
        default: false,
        index: true,
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

notificationSchema.index({
  recipientUserId: 1,
  createdAt: -1,
});

notificationSchema.index({
  restaurantId: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );