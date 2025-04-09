
const Task = require('../models/Task');
const User = require('../models/User');

const handleDispute = async (req, res) => {
  const { taskId, resolution } = req.body;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  // Apply resolution logic here (customize as needed)
  task.disputeResolved = true;
  task.resolutionNote = resolution;
  await task.save();

  res.json({ message: 'Dispute resolved' });
};

const getAllDisputes = async (req, res) => {
  const disputes = await Task.find({ isFlagged: true });
  res.json(disputes);
};

const rejectTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'rejected';
    await task.save();

    res.status(200).json({ message: 'Task rejected successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting task', error: error.message });
  }
};


module.exports = { handleDispute, getAllDisputes,rejectTask };