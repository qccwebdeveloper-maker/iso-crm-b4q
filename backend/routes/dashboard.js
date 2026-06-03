const express = require('express');
const router = express.Router();
const { USERS, APPLICATIONS, getApplications, populateApp } = require('../mockData');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, (req, res) => {
  const role = req.user.role;
  const uid = req.user._id;

  if (role === 'admin') {
    const allApps = APPLICATIONS;
    const statusCounts = {};
    allApps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
    const statusCountArr = Object.entries(statusCounts).map(([_id, count]) => ({ _id, count }));

    // Monthly apps (last 12 months)
    const monthly = {};
    allApps.forEach(a => {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthly[key] = (monthly[key] || 0) + 1;
    });
    const monthlyApps = Object.entries(monthly).map(([k, count]) => {
      const [year, month] = k.split('-').map(Number);
      return { _id: { year, month }, count };
    }).sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month).slice(-12);

    const recentApps = [...allApps].reverse().slice(0, 6).map(a => populateApp(a));

    return res.json({
      clients: USERS.filter(u => u.role === 'client').length,
      auditors: USERS.filter(u => u.role === 'auditor').length,
      reviewers: USERS.filter(u => u.role === 'reviewer').length,
      totalApplications: allApps.length,
      statusCounts: statusCountArr,
      monthlyApps,
      recentApps,
    });
  }

  if (role === 'client') {
    const myApps = APPLICATIONS.filter(a => a.client === uid);
    return res.json({
      totalApplications: myApps.length,
      submitted:   myApps.filter(a => a.status === 'submitted').length,
      underReview: myApps.filter(a => a.status === 'under_review').length,
      certified:   myApps.filter(a => a.status === 'certified').length,
      rejected:    myApps.filter(a => a.status === 'rejected').length,
      recentApps:  [...myApps].reverse().slice(0, 5).map(a => populateApp(a)),
    });
  }

  if (role === 'auditor') {
    const myApps = APPLICATIONS.filter(a => a.assignedAuditor === uid);
    return res.json({
      assigned:  myApps.length,
      pending:   myApps.filter(a => ['under_review','audit_stage1'].includes(a.status)).length,
      completed: myApps.filter(a => ['audit_stage2','approved','certified'].includes(a.status)).length,
      recentApps: [...myApps].reverse().slice(0, 5).map(a => populateApp(a)),
    });
  }

  if (role === 'reviewer') {
    const myApps = APPLICATIONS.filter(a => a.assignedReviewer === uid);
    const statusCounts = {};
    myApps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
    const statusDistribution = Object.entries(statusCounts).map(([_id, count]) => ({ _id, count }));
    return res.json({
      assignedCount:    myApps.length,
      inProgressCount:  myApps.filter(a => ['under_review','audit_stage1','audit_stage2'].includes(a.status)).length,
      completedCount:   myApps.filter(a => ['approved','certified'].includes(a.status)).length,
      pendingCount:     myApps.filter(a => a.status === 'audit_stage2').length,
      recentApplications: [...myApps].reverse().slice(0, 8).map(a => populateApp(a)),
      statusDistribution,
    });
  }

  if (role === 'sales') {
    const { getLeads } = require('../mockData');
    const leads = getLeads();
    return res.json({
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'new').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      converted: leads.filter(l => l.status === 'converted').length,
      conversionRate: leads.length ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0,
    });
  }

  res.json({});
});

module.exports = router;

// This file is complete - sales stats handled by leads route
