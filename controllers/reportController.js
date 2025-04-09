const Task = require('../models/Task');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.generateAdminReport = async (req, res) => {
  try {
    // 1. Task Completion
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });

    // 2. Total Earnings
    const allPayments = await Payment.find();
    const totalEarnings = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // 3. User Engagement
    const totalUsers = await User.countDocuments();
    const creators = await User.countDocuments({ role: 'creator' });
    const executors = await User.countDocuments({ role: 'executor' });

    res.status(200).json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
      },
      earnings: {
        total: totalEarnings,
        transactions: allPayments.length,
      },
      users: {
        total: totalUsers,
        creators,
        executors,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error });
  }
};
