const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      guests: { type: Number, required: true },
    },

    orderStatus: {
      type: String,
      required: true,
    },

    // "Dine In" orders are tied to a table;
    // "Packing" (takeaway/parcel) orders have no table.
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
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalWithTax: { type: Number, required: true },
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
    },

    // Payment can only be Cash or Online.
    // Online payment is handled manually through QR/UPI.
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

module.exports = mongoose.model("Order", orderSchema);