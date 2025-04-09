const ratingRouter = require("express").Router();
const ratingController = require("../controllers/ratingController");

ratingRouter.post("/", ratingController.rateUser);
ratingRouter.get("/:userId", ratingController.getAverageRating);

module.exports = ratingRouter;