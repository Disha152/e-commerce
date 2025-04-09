const Payment = require("../models/Payment");

exports.makePayment = async (req, res) => {
  const payment = new Payment(req.body);
  await payment.save();
  res.status(201).json(payment);
};

exports.getUserPayments = async (req, res) => {
  const payments = await Payment.find({ userId: req.params.userId });
  res.json(payments);
};
