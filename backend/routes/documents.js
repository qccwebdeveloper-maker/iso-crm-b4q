const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { APPLICATIONS } = require('../mockData');

router.get('/', protect, (req, res) => {
  const docs = [];
  APPLICATIONS.forEach(a => {
    ['applicationForm','agreement','signedForm','auditReport','reviewReport','certificate'].forEach(key => {
      if (a[key]) docs.push({ name: key, applicationId: a.applicationId, docType: key, path: a[key], uploadedAt: a.updatedAt, uploadedByName: 'System' });
    });
    (a.uploadedDocuments || []).forEach(d => {
      docs.push({ name: d.name, applicationId: a.applicationId, docType: 'document', path: d.path, uploadedAt: d.uploadedAt, uploadedByName: d.uploadedBy?.name || '—' });
    });
  });
  res.json(docs);
});

module.exports = router;
