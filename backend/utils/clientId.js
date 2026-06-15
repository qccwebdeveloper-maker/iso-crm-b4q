const User = require('../models/User');

// Generate the next sequential 4-digit clientId: 1000, 1001, 1002 ... 9999.
// Only purely-numeric clientIds count toward the series (legacy "CLT-..." ids are ignored).
async function generateClientId() {
  // Find the highest existing numeric clientId.
  const last = await User.findOne({ clientId: /^\d{4}$/ })
    .sort({ clientId: -1 })
    .select('clientId')
    .lean();

  let next = last ? parseInt(last.clientId, 10) + 1 : 1000;

  // Guard against collisions (e.g. concurrent signups) by stepping forward until free.
  for (; next <= 9999; next++) {
    const id = String(next);
    const exists = await User.findOne({ clientId: id }).select('_id').lean();
    if (!exists) return id;
  }

  throw new Error('Client ID range exhausted (1000-9999)');
}

module.exports = { generateClientId };
