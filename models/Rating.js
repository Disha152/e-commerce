const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId: String,
    score: Number,
  });
  module.exports = mongoose.model("Rating", RatingSchema);