const Task = require('../models/Task');
const Submission = require('../models/Submission');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const cloudinary = require('../utils/cloudinary');

// const createTask = async (req, res) => {
//   const { title, description, deadline, budget, skills } = req.body;
//   const attachments = [];

//   try {
//     // Check and upload files
//     if (req.files && req.files.attachments) {
//       const files = Array.isArray(req.files.attachments)
//         ? req.files.attachments
//         : [req.files.attachments];

//       for (let file of files) {
//         const uploadRes = await cloudinary.uploader.upload(file.tempFilePath, {
//           resource_type: "auto", // supports image, video, pdf, etc.
//           folder: "tasks_attachments"
//         });
//         attachments.push(uploadRes.secure_url);
//       }
//     }

//     const task = new Task({
//       title,
//       description,
//       deadline,
//       budget,
//       skills,
//       creator: req.user._id,
//       attachments,
//       status: 'pending'
//     });

//     await task.save();
//     res.status(201).json({ message: "Task created and sent for approval", task });
//   } catch (err) {
//     console.error('Error creating task:', err);
//     res.status(500).json({ message: 'Server error while creating task' });
//   }
// };
const createTask = async (req, res) => {
  const {
    title,
    description,
    deadline,
    budget,
    skills,
    attachments,
    category,
    subcategory,
    experienceLevel,
    timeCommitment,
    deliverables,
    communicationExpectations,
    additionalNotes
  } = req.body;

  const taskAttachments = [];

  try {
    // Attachments might already be uploaded to Cloudinary (received from frontend)
    if (attachments && attachments.length > 0) {
      taskAttachments.push(...attachments); // Add the URLs sent from frontend
    }

    // Create the new task
    const task = new Task({
      title,
      description,
      deadline,
      budget,
      skills,
      creator: req.user._id,
      attachments: taskAttachments,
      status: 'pending',
      category,
      subcategory,
      experienceLevel,
      timeCommitment,
      deliverables,
      communicationExpectations,
      additionalNotes
    });

    await task.save();
    res.status(201).json({ message: "Task created and sent for approval", task });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};







// const getTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id)
//       .populate('creator', 'name email')
//       .populate('assignedTo', 'name email') // Include assigned user's info
//       .populate('applicantsQueue.user', 'name email'); // If you want applicant info too

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Optionally include applicant count directly
//     const response = {
//       ...task.toObject(),
//       applicantCount: task.applicantsQueue.length,
//     };

//     res.json(response);
//   } catch (err) {
//     console.error('Error fetching task:', err);
//     res.status(500).json({ message: 'Server error while fetching task' });
//   }
// };
const getTaskWithAverageRating = async (taskId) => {
  try {
    // Fetch the task by ID (assuming this task has the 'comments' field populated)
    const task = await Task.findById(taskId).populate('creator', 'name email');

    // Check if task exists
    if (!task) {
      throw new Error('Task not found');
    }

    // Calculate the average rating from all the comments
    const ratings = task.comments.map(comment => comment.rating);  // Extract ratings from comments
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length  // Calculate average
      : 0;  // If no ratings, set to 0

    // Return the average rating
    return averageRating;
  } catch (err) {
    console.error('Error fetching task or calculating average rating:', err);
    throw new Error('Server error while calculating average rating');
  }
};



// GET /tasks - Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('creator', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};



// PUT /tasks/:id - Update task
const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    
    res.json({ message: 'Task updated', task: updatedTask });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

const getTask = async (req, res) => {
  const taskId = req.params.id;  // Assume the task ID is passed in the URL

  try {
    // Get the average rating for the task
    const averageRating = await getTaskWithAverageRating(taskId);

    // Fetch the task with other details if needed
    const task = await Task.findById(taskId).populate('creator', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Send the task data along with the calculated average rating
    res.json({ ...task.toObject(), averageRating });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error while fetching task or calculating average rating' });
  }
};


// DELETE /tasks/:id - Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

// GET /tasks/browse - Browse tasks based on user skills
const browseTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({ message: "Please update your skills to browse relevant tasks." });
    }

    const tasks = await Task.find({ status: 'open', skills: { $in: user.skills } });

    res.status(200).json({ tasks });
  } catch (err) {
    console.error('Browse tasks error:', err);
    res.status(500).json({ message: 'Server error while browsing tasks' });
  }
};

// POST /tasks/assign - Assign task to user
const assignTask = async (req, res) => {
  const { taskId, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: userId, status: 'assigned' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: `📝 New Task Assigned: ${task.title}`,
      text: `Hello ${user.name},\n\nYou have been assigned a new task: "${task.title}".\n\nDeadline: ${task.deadline?.toDateString()}\n\nPlease log in to the platform to check details.\n\nThanks,\nTask Assigner`
    });

    res.json({ message: 'Task assigned and user notified via email', task });
  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({ message: 'Server error while assigning task' });
  }
};

// GET /tasks/my-created - Get tasks created by the user
const getMyCreatedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ creator: req.user._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks created by user:', err);
    res.status(500).json({ message: 'Error fetching created tasks' });
  }
};

// POST /tasks/:taskId/review - Review task submission
const reviewSubmission = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to review this task' });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({ message: 'Task not marked as completed yet' });
    }

    res.json({
      title: task.title,
      assignedTo: task.assignedTo.name,
      status: task.status,
      submission: task.submission,
      submittedAt: task.updatedAt
    });
  } catch (err) {
    console.error('Error reviewing submission:', err);
    res.status(500).json({ message: 'Error reviewing submission' });
  }
};

// POST /tasks/:taskId/apply - Apply for a task
const applyForTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user._id;
  const { coverLetter } = req.body; // Optional

  try {
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if user has already applied
    const alreadyInQueue = task.applicantsQueue?.some(
      (applicant) => applicant.user.toString() === userId.toString()
    );
    if (alreadyInQueue)
      return res.status(400).json({ message: 'You have already applied to this task.' });

    if (task.status === 'open' && !task.assignedTo) {
      // Assign task to this user
      task.assignedTo = userId;
      task.status = 'assigned';
      await task.save();
      return res.status(200).json({
        message: 'Task successfully assigned to you!',
        task,
      });
    }

    // If already assigned, add to queue
    if (!task.applicantsQueue) task.applicantsQueue = [];
    task.applicantsQueue.push({
      user: userId,
      coverLetter,
      appliedAt: new Date(),
    });

    await task.save();
    return res.status(200).json({
      message: 'Task already assigned. You have been added to the applicant queue.',
    });
  } catch (err) {
    console.error('Error applying for task:', err);
    res.status(500).json({ message: 'Server error while applying for task' });
  }
};


// GET /tasks/:taskId/review-applications - Review applications for a task
const reviewApplications = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to review applications for this task' });
    }

    const queue = await Task.findById(taskId)
  .populate('applicantsQueue.user', 'name email skills')
  .select('applicantsQueue assignedTo');

res.json({ applicantsQueue: queue.applicantsQueue, assignedTo: queue.assignedTo });


    res.json({ applications });
  } catch (err) {
    console.error('Error reviewing applications:', err);
    res.status(500).json({ message: 'Server error while reviewing applications' });
  }
};

// POST /tasks/:taskId/approve/:userId - Approve user for the task
const approveUserForTask = async (req, res) => {
  const { taskId, userId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to approve user for this task' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is not open for assignment' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    task.assignedTo = userId;
    task.status = 'assigned';
    await task.save();

    await Submission.updateMany({ task: taskId }, { $set: { status: 'rejected' } });
    await Submission.findOneAndUpdate({ task: taskId, applicant: userId }, { $set: { status: 'approved' } });

    // Send email to the approved user
    await sendEmail({
      to: user.email,
      subject: `✅ You have been approved for task: ${task.title}`,
      text: `Hi ${user.name},\n\nYou’ve been approved to work on the task: "${task.title}".\n\nLogin to begin!\n\nThanks,\nTask Team`
    });

    res.json({ message: 'User approved and assigned to task', task });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server error while approving user' });
  }
};

const getTaskSubmissions = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const submissions = await Submission.find({ task_id: taskId });

    if (!submissions) {
      return res.status(404).json({ message: 'No submissions found for this task.' });
    }

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// const addCommentToTask = async (req, res) => {
//   try {
//     const taskId = req.params.id;
//     const { comment } = req.body;

//     if (!comment || !comment.trim()) {
//       return res.status(400).json({ message: "Comment is required." });
//     }

//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: "Task not found." });
//     }

//     const newComment = {
//       text: comment,
//       author: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email
//       },
//       createdAt: new Date()
//     };

//     task.comments.push(newComment);
//     await task.save();

//     res.status(200).json({ message: "Comment added successfully", comment: newComment });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


const addCommentToTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { comment, rating } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const newComment = {
      text: comment,
      rating,
      author: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      createdAt: new Date()
    };

    task.comments.push(newComment);
    await task.save();

    res.status(200).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAverageRating = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const ratings = task.comments.map(c => c.rating).filter(r => r);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b) / ratings.length) : 0;

    res.status(200).json({ averageRating: avgRating.toFixed(1) });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getTaskComments = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId).select("comments");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const approveTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = 'open';
    await task.save();

    res.status(200).json({ message: 'Task approved successfully', task });
  } catch (err) {
    console.error('Error approving task:', err);
    res.status(500).json({ message: 'Server error while approving task' });
  }
};

// POST /:taskId/assign/:userId - Assign task to a user from the queue
const assignUserFromQueue = async (req, res) => {
  const { taskId, userId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to assign users to this task' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user is in the queue
    const isInQueue = task.applicantsQueue.some(applicant =>
      applicant.user.toString() === userId
    );
    if (!isInQueue) {
      return res.status(400).json({ message: 'User is not in the applicant queue' });
    }

    // Assign the task
    task.assignedTo = userId;
    task.status = 'assigned';
    await task.save();

    // Notify user
    await sendEmail({
      to: user.email,
      subject: `📝 You’ve been assigned a new task!`,
      text: `Hi ${user.name},\n\nYou’ve been selected for the task "${task.title}". Check the platform for details.\n\nThanks,\nTask Assigner`
    });

    res.json({ message: 'User successfully assigned to the task', task });
  } catch (err) {
    console.error('Error assigning from queue:', err);
    res.status(500).json({ message: 'Error assigning user from queue' });
  }
};










module.exports = { 
  createTask, 
  getTask, 
  getAllTasks, 
  updateTask, 
  deleteTask, 
  browseTasks, 
  assignTask, 
  getMyCreatedTasks, 
  reviewSubmission, 
  applyForTask, 
  reviewApplications, 
  approveTask,
  approveUserForTask ,
  getTaskSubmissions,
  addCommentToTask,
  getTaskComments,
  assignUserFromQueue,
  getAverageRating,
  getTaskWithAverageRating
};
