// models/Category.js
const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subcategories: [subcategorySchema], // Array of subcategories
});

module.exports = mongoose.model("Category", categorySchema);
