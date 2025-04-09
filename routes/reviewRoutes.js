const reviewRouter = require("express").Router();
const reviewController = require("../controllers/reviewController");

reviewRouter.post("/", reviewController.postReview);
reviewRouter.get("/:taskId", reviewController.getReviewsForTask);

module.exports = reviewRouter;
