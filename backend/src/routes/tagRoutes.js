const express = require('express');
const router = express.Router();
const {
  batchGenerateTags,
  claimTag,
  buyScanner,
  registerAndClaim,
  getMyTags,
  updateVehicleDocuments,
  updatePurchaseStatus,
  checkTagAvailability
} = require('../controllers/tagController');
const { protect, adminKeyAuth } = require('../middlewares/authMiddleware');

// Check physical sticker code availability & first-time scan eligibility
router.get('/check/:tagCode', checkTagAvailability);

// Batch generate stickers for printing (Admin or Admin Key)
router.post('/generate', adminKeyAuth, batchGenerateTags);
router.post('/batch-generate', adminKeyAuth, batchGenerateTags);

// Public 1-step register user + claim sticker + emergency contacts + docs
router.post('/register-and-claim', registerAndClaim);

// Buy fresh QR scanner(s) (Authenticated User)
router.post('/buy', protect, buyScanner);
router.post('/purchase', protect, buyScanner);

// Protected routes for vehicle owner
router.post('/claim', protect, claimTag);
router.get('/my-tags', protect, getMyTags);

// Update vehicle documents (PUC, Insurance, RC)
router.put('/:tagCode/documents', protect, updateVehicleDocuments);

// Update purchase / subscription status (Admin or payment gateway)
router.put('/:tagCode/purchase', protect, updatePurchaseStatus);

module.exports = router;
