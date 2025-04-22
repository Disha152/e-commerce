const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");

// POST /api/tasks/:taskId/comments
router.post("/:taskId/comments", protect, async (req, res) => {
  try {
    const { text, rating } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

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
    await task.save();

    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
