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


module.exports = { getUserProfile, getAllUsers, updateSkills, deleteUserById, };
