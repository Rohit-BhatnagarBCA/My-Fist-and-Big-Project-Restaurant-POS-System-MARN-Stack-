const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  isAvailable: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
});

module.exports = mongoose.model("Dish", dishSchema);