const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  addVehicle,
  getMyVehicles,
  addEmergencyContact,
  deleteEmergencyContact
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Auth Endpoints
router.post('/register', register);
router.post('/login', login);

// Profile Endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Vehicle Endpoints (Linked to separate Vehicle collection)
router.post('/vehicles', protect, addVehicle);
router.get('/vehicles', protect, getMyVehicles);

// Emergency Contacts Endpoints
router.post('/emergency-contacts', protect, addEmergencyContact);
router.delete('/emergency-contacts/:contactId', protect, deleteEmergencyContact);

module.exports = router;
