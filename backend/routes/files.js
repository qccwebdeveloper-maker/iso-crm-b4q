const express = require('express');
const router  = express.Router();
const { getSignedFileUrl } = require('../utils/s3');

// GET /api/files/<s3-object-key>
// The browser opens this link (stored as a document's `path`). We mint a fresh,
// short-lived presigned URL and 302-redirect to it, so the S3 bucket can stay
// fully private with "Block all public access" ON.
router.get('/*', async (req, res) => {
  try {
    const key = req.params[0];
    if (!key) return res.status(400).json({ message: 'Missing file key' });
    const url = await getSignedFileUrl(key);
    res.redirect(302, url);
  } catch (err) {
    console.error('[S3] presign failed:', err.message);
    res.status(500).json({ message: 'Could not load file' });
  }
});

module.exports = router;
