const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const newMessage = new Message({ sender: req.user._id, receiver: receiverId, message });
  await newMessage.save();
  res.json(newMessage);
};

const getMessages = async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id }
    ]
  });
  res.json(messages);
};

module.exports = { sendMessage, getMessages };