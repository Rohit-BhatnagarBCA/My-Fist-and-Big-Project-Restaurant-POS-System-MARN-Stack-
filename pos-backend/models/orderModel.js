const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    customerDetails: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      guests: {
        type: Number,
        required: true,
      },
    },

    orderStatus: {
      type: String,
      required: true,
    },

    orderType: {
      type: String,
      enum: ["Dine In", "Packing"],
      default: "Dine In",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    bills: {
      total: {
        type: Number,
        required: true,
      },

      tax: {
        type: Number,
        required: true,
      },

      totalWithTax: {
        type: Number,
        required: true,
      },
    },

    items: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },

    // Cash or Online only.
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  restaurantId: 1,
  orderDate: -1,
});

module.exports = mongoose.model(
  "Order",
  orderSchema
);