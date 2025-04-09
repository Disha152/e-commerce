const paymentRouter = require("express").Router();
const paymentController = require("../controllers/paymentController");

paymentRouter.post("/", paymentController.makePayment);
paymentRouter.get("/user/:userId", paymentController.getUserPayments);

module.exports = paymentRouter;
