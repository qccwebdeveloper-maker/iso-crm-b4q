const express = require('express');
const router  = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, USERS, markNotificationRead } = require('../mockData');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users — admin and sales can list users
router.get('/', protect, authorize('admin', 'sales'), (req, res) => {
  const { role } = req.query;
  res.json(getUsers(role ? { role } : {}));
});

// GET /api/users/me/notifications
router.get('/me/notifications', protect, (req, res) => {
  const user = USERS.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json([...(user.notifications || [])].reverse().slice(0, 20));
});

// PUT /api/users/me/notifications/:notifId
router.put('/me/notifications/:notifId', protect, (req, res) => {
  markNotificationRead(req.user._id, req.params.notifId);
  res.json({ message: 'Marked as read' });
});

// GET /api/users/:id
router.get('/:id', protect, (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// POST /api/users — admin and sales can create users (with immediate activation)
router.post('/', protect, authorize('admin', 'sales'), (req, res) => {
  const { name, email, password, role, phone, company } = req.body;
  const exists = USERS.find(u => u.email === email);
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'name, email, password and role are required' });
  const user = createUser({ name, email, password, role, phone, company, isActive: true, pendingApproval: false });
  res.status(201).json(user);
});

// PUT /api/users/:id — admin can update anything (including isActive for approvals)
router.put('/:id', protect, (req, res) => {
  const user = updateUser(req.params.id, req.body);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User updated', user });
});

// DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin', 'sales'), (req, res) => {
  const ok = deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
});

module.exports = router;
