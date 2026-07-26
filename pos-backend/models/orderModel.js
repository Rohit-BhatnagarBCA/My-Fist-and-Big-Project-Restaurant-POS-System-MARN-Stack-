const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerDetails: {
        name: { type: String, required: true },
        phone: { type: String, required: true }, // Fixed typo "requried" -> "required"
        guests: { type: Number, required: true },
    },
    orderStatus: {
        type: String,
        required: true
    },
    // "Dine In" orders are tied to a table; "Packing" (takeaway/parcel)
    // orders have no table at all.
    orderType: {
        type: String,
        enum: ["Dine In", "Packing"],
        default: "Dine In"
    },
    orderDate: {
        type: Date,
        default: Date.now // Removed parentheses () so it evaluates at creation time, not file load time
    },
    bills: {
        total: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalWithTax: { type: Number, required: true }
    },
    // Loose array [] ko ek strict sub-document array mein convert kiya hai
    items: [
        {
            dishId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Dish",
                required: true // Har order item ke paas apni asli Dish database ID hona zaroori hai
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    paymentMethod: String,
    paymentData: {
        razorpay_order_id: String,
        razorpay_payment_id: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);