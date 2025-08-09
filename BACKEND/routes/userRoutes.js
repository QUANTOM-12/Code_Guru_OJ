const express = require('express');
const router = express.Router();

// Example GET endpoint to test if routing works
router.get('/', (req, res) => {
  res.json({ success: true, message: 'User routes working!' });
});

module.exports = router;