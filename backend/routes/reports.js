const express     = require('express');
const router      = express.Router();
const Application = require('../models/Application');
const User        = require('../models/User');
const Lead        = require('../models/Lead');
const Payment     = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

// GET /api/reports â€” admin analytics
router.get('/', protect, authorize('admin', 'sales'), async (req, res) => {
  try {
    const [
      totalApplications, totalClients, totalAuditors,
      certifiedCount, rejectedCount,
      statusCounts, monthlyApps,
      totalLeads, convertedLeads,
      totalPayments,
    ] = await Promise.all([
      Application.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'auditor' }),
      Application.countDocuments({ status: 'certified' }),
      Application.countDocuments({ status: 'rejected' }),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'converted' }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      totalApplications, totalClients, totalAuditors,
      certifiedCount, rejectedCount,
      complianceRate: totalApplications ? Math.round((certifiedCount / totalApplications) * 100) : 0,
      statusCounts, monthlyApps,
      totalLeads, convertedLeads,
      conversionRate: totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      totalRevenue: totalPayments[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

