const express = require('express');
const router = express.Router();
const { getMyAlerts, resolveAlert } = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes for vehicle owner to view and manage received alerts
router.get('/my-alerts', protect, getMyAlerts);
router.put('/:id/resolve', protect, resolveAlert);

module.exports = router;
