const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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

    icon: {
      type: String,
      required: true,
    },

    bgColor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same category name can exist in multiple restaurants,
// but not twice inside one restaurant.
categorySchema.index(
  { restaurantId: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Category",
  categorySchema
);