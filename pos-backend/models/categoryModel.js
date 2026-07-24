const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, required: true },
  bgColor: { type: String, required: true },
});

module.exports = mongoose.model("Category", categorySchema);
