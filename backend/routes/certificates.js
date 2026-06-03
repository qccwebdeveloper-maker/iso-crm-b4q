const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { APPLICATIONS } = require('../mockData');

let CERT_SETTINGS = { title: 'Certificate of Registration', authority: 'QC Certification Pvt Ltd', validityYears: 3, footerText: 'Subject to certification body regulations.', accreditation: 'NABCB' };
const MANUAL_CERTS = [];
let mcCounter = 1;

router.get('/', protect, (req, res) => {
  const appCerts = APPLICATIONS.filter(a => a.status === 'certified' && a.certificate).map(a => ({
    _id: a._id, organizationName: a.organizationName, standard: a.isoStandard,
    issueDate: a.certificateIssueDate, expiryDate: a.certificateExpiryDate,
    filePath: a.certificate, status: 'Active', certNumber: a.certNumber || null,
  }));
  res.json([...appCerts, ...MANUAL_CERTS]);
});

router.get('/settings', protect, (req, res) => res.json(CERT_SETTINGS));

router.put('/settings', protect, authorize('admin'), (req, res) => {
  CERT_SETTINGS = { ...CERT_SETTINGS, ...req.body };
  res.json(CERT_SETTINGS);
});

router.post('/manual', protect, authorize('admin'), (req, res) => {
  const cert = { _id: 'mc' + mcCounter++, ...req.body, status: 'Active', createdAt: new Date() };
  MANUAL_CERTS.push(cert);
  res.status(201).json(cert);
});

router.put('/:id', protect, authorize('admin'), (req, res) => {
  const app = APPLICATIONS.find(a => a._id === req.params.id);
  if (app) {
    if (req.body.issueDate) app.certificateIssueDate = new Date(req.body.issueDate);
    if (req.body.expiryDate) app.certificateExpiryDate = new Date(req.body.expiryDate);
    if (req.body.certNumber) app.certNumber = req.body.certNumber;
    return res.json({ message: 'Updated' });
  }
  const mc = MANUAL_CERTS.find(c => c._id === req.params.id);
  if (mc) { Object.assign(mc, req.body); return res.json(mc); }
  res.status(404).json({ message: 'Not found' });
});

module.exports = router;
