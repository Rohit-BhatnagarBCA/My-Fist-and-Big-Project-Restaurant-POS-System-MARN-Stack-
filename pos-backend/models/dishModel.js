const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dishSchema.index({
  restaurantId: 1,
});

module.exports = mongoose.model(
  "Dish",
  dishSchema
);