const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendOtpEmail, sendWelcomeEmail } = require('../utils/email');

const SECRET   = process.env.JWT_SECRET || 'crm_secret_key_2024';
const genToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '7d' });
const hashPw   = (pw)  => bcrypt.hash(pw, 10);

// In-memory OTP store { email: { otp, expiry, userId } }
const OTP_STORE = {};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email / Client ID and password are required' });

    const identifier = email.trim();
    const isEmail    = identifier.includes('@');
    const user       = await User.findOne(
      isEmail ? { email: identifier.toLowerCase() }
              : { clientId: identifier }
    );
    if (!user) return res.status(401).json({
      message: isEmail ? 'Invalid email or password' : 'Invalid Client ID or password',
    });

    if (!user.isActive) {
      if (user.pendingApproval) return res.status(401).json({ message: 'Your account is pending admin approval.' });
      return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ ...user.toJSON(), token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/client-send-otp  — step 1: verify clientId+password, send OTP to client email
router.post('/client-send-otp', async (req, res) => {
  try {
    const { clientId, password } = req.body;
    if (!clientId || !password) return res.status(400).json({ message: 'Client ID and password are required' });

    const user = await User.findOne({ clientId: clientId.trim() });
    if (!user) return res.status(401).json({ message: 'Invalid Client ID or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is inactive. Contact admin.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid Client ID or password' });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    OTP_STORE[user.email] = { otp, expiry, userId: user._id.toString() };

    const result = await sendOtpEmail({ to: user.email, name: user.name, otp, expiresInMinutes: 10 });
    console.log(`[OTP] Client OTP sent to ${user.email} via ${result.via}`);

    // Mask email: ar***@gmail.com
    const masked = user.email.replace(/^(.{2})(.+)(@.+)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c);

    res.json({
      message:   `OTP sent to your registered email.`,
      maskedEmail: masked,
      emailSent: result.ok,
      via:       result.via,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/client-verify-otp  — step 2: verify OTP, return token
router.post('/client-verify-otp', async (req, res) => {
  try {
    const { clientId, otp } = req.body;
    if (!clientId || !otp) return res.status(400).json({ message: 'Client ID and OTP are required' });

    const user = await User.findOne({ clientId: clientId.trim() });
    if (!user) return res.status(401).json({ message: 'Invalid Client ID' });

    const record = OTP_STORE[user.email];
    if (!record) return res.status(400).json({ message: 'No OTP requested. Please go back and send OTP again.' });
    if (Date.now() > record.expiry) {
      delete OTP_STORE[user.email];
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== otp.toString().trim()) return res.status(400).json({ message: 'Invalid OTP. Try again.' });

    delete OTP_STORE[user.email];
    const fullUser = await User.findById(record.userId).select('-password');
    if (!fullUser || !fullUser.isActive) return res.status(403).json({ message: 'Account is inactive.' });

    res.json({ ...fullUser.toJSON(), token: genToken(fullUser._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Admin email required' });

    const admin = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'No admin account found with this email' });
    if (!admin.isActive) return res.status(403).json({ message: 'Admin account is inactive' });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    OTP_STORE[email.toLowerCase()] = { otp, expiry, userId: admin._id.toString() };

    const result = await sendOtpEmail({ to: admin.email, name: admin.name, otp, expiresInMinutes: 10 });

    console.log(`[OTP] Sent to ${admin.email} via ${result.via}`);

    res.json({
      message:   `OTP sent to ${admin.email}. Check your inbox.`,
      adminName: admin.name,
      emailSent: result.ok,
      via:       result.via,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const key    = email.toLowerCase().trim();
    const record = OTP_STORE[key];
    if (!record)                    return res.status(400).json({ message: 'No OTP sent to this email. Request a new one.' });
    if (Date.now() > record.expiry) { delete OTP_STORE[key]; return res.status(400).json({ message: 'OTP expired. Request a new one.' }); }
    if (record.otp !== otp.toString().trim()) return res.status(400).json({ message: 'Invalid OTP.' });
    delete OTP_STORE[key];

    const user = await User.findById(record.userId).select('-password');
    if (!user || !user.isActive) return res.status(403).json({ message: 'Admin account is inactive' });

    res.json({ ...user.toJSON(), token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/register-client
router.post('/register-client', async (req, res) => {
  try {
    const { companyName, email, password, mobile, address, standard, scope } = req.body;
    if (!companyName || !email || !password || !mobile || !address || !standard || !scope)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const clientId = 'CLT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const hashed   = await hashPw(password);

    const user = await User.create({
      name: companyName, email: email.toLowerCase(), password: hashed, role: 'client',
      phone: mobile, company: companyName, address, isoStandard: standard, scope,
      clientId, isActive: false, pendingApproval: true,
    });

    sendWelcomeEmail({ to: email, name: companyName, clientId, email, password })
      .catch(e => console.warn('[Welcome email failed]', e.message));

    res.status(201).json({ message: 'Registration successful. Pending admin approval.', clientId: user.clientId, email: user.email, name: user.name });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/seed
router.post('/seed', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0 && req.query.force !== 'true')
      return res.json({ message: `${count} users exist. Add ?force=true to reseed.` });
    const { execSync } = require('child_process');
    const path = require('path');
    execSync(`node "${path.join(__dirname, '../seed.js')}"`, { stdio: 'inherit' });
    res.json({ message: 'Database seeded successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
