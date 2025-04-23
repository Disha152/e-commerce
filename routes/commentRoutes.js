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


// PUT /api/tasks/:taskId/comments/:commentId
router.put("/:taskId/comments/:commentId", protect, async (req, res) => {
  try {
    const { text, rating } = req.body;
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Find the comment by ID
    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the logged-in user is the author of the comment
    if (comment.author.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    // Update the comment text and rating
    comment.text = text || comment.text;
    comment.rating = rating || comment.rating;

    await task.save();
    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// DELETE /api/tasks/:taskId/comments/:commentId
router.delete("/:taskId/comments/:commentId", protect, async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Find the comment by ID
    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the logged-in user is the author of the comment
    if (comment.author.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment
    comment.remove();

    await task.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});




module.exports = router;
