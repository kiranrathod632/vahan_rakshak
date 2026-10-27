const express = require('express');
const path = require('path');
const router = express.Router();
const { getTagScanInfo } = require('../controllers/scanController');
const { triggerAlert } = require('../controllers/alertController');

// Public endpoint when QR code is scanned (Serves React UI for browsers, JSON for API clients)
router.get('/:tagCode', (req, res, next) => {
  if (req.accepts('html') && !req.xhr && req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.sendFile(path.join(__dirname, '../../public/index.html'));
  }
  return getTagScanInfo(req, res, next);
});

// Public endpoint to trigger alert (No-Parking or Accident SOS)
router.post('/:tagCode/alert', triggerAlert);

module.exports = router;
