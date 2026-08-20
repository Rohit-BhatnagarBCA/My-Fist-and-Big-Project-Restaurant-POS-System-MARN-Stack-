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
    },

    status: {
      type: String,
      default: "Available",
    },

    seats: {
      type: Number,
      required: true,
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

tableSchema.index(
  { restaurantId: 1, tableNo: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Table",
  tableSchema
);