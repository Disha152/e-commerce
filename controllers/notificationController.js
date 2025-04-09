const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id });
  res.json(notifications);
};

exports.markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.sendStatus(200);
};