const Rating = require("../models/Rating");

exports.rateUser = async (req, res) => {
  const rating = new Rating(req.body);
  await rating.save();
  res.status(201).json(rating);
};

exports.getAverageRating = async (req, res) => {
  const ratings = await Rating.find({ userId: req.params.userId });
  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  res.json({ averageRating: avg });
};