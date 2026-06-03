const jwt = require('jsonwebtoken');
const { getUserById } = require('../mockData');

const SECRET = process.env.JWT_SECRET || 'crm_secret_key_2024';

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    const user = getUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};

module.exports = { protect, authorize };
