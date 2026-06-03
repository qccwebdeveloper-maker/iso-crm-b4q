const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { getUserByEmail, USERS, createUser } = require('../mockData');
const { protect } = require('../middleware/auth');

const SECRET   = process.env.JWT_SECRET || 'crm_secret_key_2024';
const genToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '7d' });

// In-memory OTP store { phone: { otp, expiry, userId } }
const OTP_STORE = {};

// ── POST /api/auth/login  (email + password)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.isActive) {
    if (user.pendingApproval) return res.status(401).json({ message: 'Your account is pending admin approval. Please wait for activation.' });
    return res.status(401).json({ message: 'Account has been deactivated. Contact admin.' });
  }
  const match = bcrypt.compareSync(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid email or password' });
  const { password: _pw, ...safe } = user;
  res.json({ ...safe, token: genToken(user._id) });
});

// ── GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const user = USERS.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// ── POST /api/auth/send-otp  (admin phone login)
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number required' });

  // find admin user by phone
  const admin = USERS.find(u => u.role === 'admin' && (u.phone === phone || u.phone === phone.replace(/\D/g,'')));
  if (!admin) return res.status(404).json({ message: 'No admin account found with this mobile number' });

  const otp    = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  OTP_STORE[phone] = { otp, expiry, userId: admin._id };

  // In production: send via SMS gateway (Twilio / MSG91)
  console.log(`\n[OTP] Admin: ${admin.name} | Phone: ${phone} | OTP: ${otp}\n`);

  res.json({
    message: 'OTP sent successfully',
    adminName: admin.name,
    // Remove demo_otp in production — included here for development
    demo_otp: otp,
  });
});

// ── POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

  const record = OTP_STORE[phone];
  if (!record) return res.status(400).json({ message: 'No OTP was requested for this number. Please request a new OTP.' });
  if (Date.now() > record.expiry) {
    delete OTP_STORE[phone];
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp.toString()) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }

  delete OTP_STORE[phone]; // one-time use

  const user = USERS.find(u => u._id === record.userId);
  if (!user || !user.isActive) return res.status(403).json({ message: 'Admin account is inactive' });
  if (user.role !== 'admin') return res.status(403).json({ message: 'OTP login is only for admin accounts' });

  const { password: _pw, ...safe } = user;
  res.json({ ...safe, token: genToken(user._id) });
});

// ── POST /api/auth/register-client  (public — new client self-registration)
router.post('/register-client', (req, res) => {
  const { companyName, email, password, mobile, address, standard, scope } = req.body;

  if (!companyName || !email || !password || !mobile || !address || !standard || !scope) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const exists = USERS.find(u => u.email === email);
  if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

  // Generate unique client ID
  const clientId = 'CLT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();

  const newUser = createUser({
    name:           companyName,
    email,
    password,
    role:           'client',
    phone:          mobile,
    company:        companyName,
    address,
    isoStandard:    standard,
    scope,
    clientId,
    isActive:       false,        // ← pending admin approval
    pendingApproval: true,
    notifications:  [],
    assignedApplications: [],
  });

  console.log(`\n[REGISTER] New client: ${companyName} | ${email} | clientId: ${clientId}\n`);

  res.status(201).json({
    message:  'Registration successful. Pending admin approval.',
    clientId: newUser.clientId || clientId,
    email:    newUser.email,
    name:     newUser.name,
  });
});

// ── POST /api/auth/seed (keep for compat)
router.post('/seed', (req, res) => {
  res.json({ message: 'Demo users already loaded (mock mode)' });
});

module.exports = router;
