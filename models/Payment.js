
const mongoose = require('mongoose');
const PaymentSchema = new mongoose.Schema({
    userId: String,
    taskId: String,
    amount: Number,
    method: String,
  });
  module.exports = mongoose.model("Payment", PaymentSchema);