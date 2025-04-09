const Review = require("../models/Review");

exports.postReview = async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.status(201).json(review);
};

exports.getReviewsForTask = async (req, res) => {
  const reviews = await Review.find({ taskId: req.params.taskId });
  res.json(reviews);
};