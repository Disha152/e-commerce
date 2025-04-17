const User = require('../models/User');



// GET /users/profile
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
};

// GET /users/all (admin only)
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

const updateSkills = async (req, res) => {
  try {
    const { skills, interests } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { skills, interests }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update skills/interests." });
  }
};

// DELETE /users/:id (admin only)
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Save Task
const saveTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const taskId = req.params.taskId;

    if (!user.savedTasks.includes(taskId)) {
      user.savedTasks.push(taskId);
      await user.save();
    }

    res.status(200).json({ message: 'Task saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save task', error: err.message });
  }
};

// Unsave Task
const unsaveTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const taskId = req.params.taskId;

    user.savedTasks = user.savedTasks.filter(
      (id) => id.toString() !== taskId
    );
    await user.save();

    res.status(200).json({ message: 'Task unsaved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unsave task', error: err.message });
  }
};

// Get Saved Tasks
const getSavedTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedTasks');
    res.status(200).json(user.savedTasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get saved tasks', error: err.message });
  }
};



module.exports = { getUserProfile, getAllUsers, updateSkills, deleteUserById, getSavedTasks,unsaveTask,saveTask};
