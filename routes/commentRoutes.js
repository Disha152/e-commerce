// const express = require('express');
// const router = express.Router();
// const Task = require('../models/Task');
// const { protect } = require('../middleware/auth'); // Ensure user is logged in

// // Add comment with rating
// router.post('/comment/:taskId', protect, async (req, res) => {
//   const { text, rating } = req.body;
//   const { taskId } = req.params;

//   // Validate the input
//   if (!text || rating < 1 || rating > 5) {
//     return res.status(400).json({ message: 'Invalid comment or rating' });
//   }

//   try {
//     // Find the task by ID
//     const task = await Task.findById(taskId);

//     if (!task) {
//       console.error(`Task with ID ${taskId} not found`);
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Create new comment object
//     const newComment = {
//       text,
//       rating,
//       author: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//       },
//     };

//     // Push the comment to the task's comments array
//     task.comments.push(newComment);

//     // Recalculate the average rating
//     await task.calculateAverageRating().catch((err) => {
//       console.error('Error calculating average rating:', err);
//     });

//     // Save the task with the new comment
//     await task.save();

//     // Respond with success message and the new comment
//     res.status(201).json({
//       message: 'Comment added successfully',
//       comment: newComment,
//     });
//   } catch (error) {
//     console.error('Error adding comment:', error.message);
//     console.error(error.stack); // Log the stack trace for more details
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

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
      taskId: task._id, // Optional but good for clarity
    };

    task.comments.push(newComment);

    // ✅ Set the averageRating manually
    task.averageRating = task.calculateAverageRating();

    await task.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
      averageRating: task.averageRating,
    });
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
