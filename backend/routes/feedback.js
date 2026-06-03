const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { APPLICATIONS } = require('../mockData');

// GET /api/feedback — aggregated feedback from all applications for admin
router.get('/', protect, (req, res) => {
  const all = [];
  APPLICATIONS.forEach(a => {
    (a.feedbacks || []).forEach(f => {
      all.push({
        ...f,
        applicationId: a.applicationId,
        organizationName: a.organizationName,
        isoStandard: a.isoStandard,
        appMongoId: a._id,
      });
    });
  });
  all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(all);
});

module.exports = router;
