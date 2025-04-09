const Dispute = require('../models/Dispute');

// Raise a dispute
const raiseDispute = async (req, res) => {
  try {
    const { taskId, reason } = req.body;

    const dispute = new Dispute({
      task: taskId,
      raisedBy: req.user._id,
      reason,
    });

    await dispute.save();
    res.status(201).json({ message: "Dispute raised successfully", dispute });
  } catch (error) {
    res.status(500).json({ message: "Error raising dispute", error: error.message });
  }
};

// Admin resolves a dispute
const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, status } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = status || 'resolved';
    dispute.resolution = resolution;

    await dispute.save();
    res.status(200).json({ message: "Dispute resolved", dispute });
  } catch (error) {
    res.status(500).json({ message: "Error resolving dispute", error: error.message });
  }
};

// Admin views all open disputes
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('task').populate('raisedBy');
    res.status(200).json(disputes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching disputes", error: error.message });
  }
};

module.exports = {
  raiseDispute,
  resolveDispute,
  getAllDisputes
};
