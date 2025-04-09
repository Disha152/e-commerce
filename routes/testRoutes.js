const express = require('express');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    await sendEmail(to, subject, text);
    res.status(200).json({ message: 'Email sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Email failed to send.', error: err.message });
  }
});

module.exports = router;
