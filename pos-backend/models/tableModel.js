const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    tableNo: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Booked",
      ],
      default: "Available",
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// A restaurant cannot have duplicate table numbers.
// Different restaurants CAN have the same table number.
tableSchema.index(
  {
    restaurantId: 1,
    tableNo: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "Table",
    tableSchema
  );