const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth'); // Ensure user is logged in

// Add comment with rating
router.post('/comment/:taskId', protect, async (req, res) => {
  const { text, rating } = req.body;
  const { taskId } = req.params;

  if (!text || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid comment or rating' });
  }

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newComment = {
      text,
      rating,
      author: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    };

    task.comments.push(newComment);
    await task.calculateAverageRating(); // Recalculate the average rating

    await task.save();
    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;