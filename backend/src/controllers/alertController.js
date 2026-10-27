const Tag = require('../models/Tag');
const User = require('../models/User');
const AlertLog = require('../models/AlertLog');
const notificationService = require('../services/notificationService');

/**
 * @desc    Public trigger alert when a scanner selects No-Parking or Accident
 * @route   POST /api/scan/:tagCode/alert
 * @access  Public
 */
const triggerAlert = async (req, res, next) => {
  try {
    const { tagCode } = req.params;
    const {
      alertType,
      latitude,
      longitude,
      address,
      scannerName,
      scannerPhone,
      scannerNote
    } = req.body;

    if (!alertType) {
      return res.status(400).json({
        success: false,
        message: 'Please specify alert type (e.g. NO_PARKING or ACCIDENT)'
      });
    }

    const cleanTagCode = tagCode.trim().toUpperCase();
    const tag = await Tag.findOne({ tagCode: cleanTagCode }).populate('user');

    if (!tag || tag.status !== 'ACTIVE' || !tag.user) {
      return res.status(404).json({
        success: false,
        message: 'Active vehicle registration not found for this QR tag.'
      });
    }

    const owner = tag.user;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const googleMapsUrl = (latitude && longitude)
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : (address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : '');

    const locationData = {
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      address: address || '',
      googleMapsUrl
    };

    const scannerData = {
      name: scannerName || 'Concerned Citizen',
      phone: scannerPhone || null,
      ipAddress,
      userAgent
    };

    let dispatchResult = null;
    let messageToScanner = '';

    // Route alert based on urgency and type
    if (alertType === 'ACCIDENT') {
      // Emergency: Notify Family Members + Owner
      dispatchResult = await notificationService.sendAccidentAlert({
        owner,
        tag,
        location: locationData,
        scannerDetails: scannerData,
        scannerNote: scannerNote || 'Emergency assistance needed immediately'
      });

      messageToScanner = 'Emergency SOS alert has been immediately dispatched to family members and vehicle owner with your location!';
    } else {
      // Parking / Vehicle Issue: Notify Owner
      dispatchResult = await notificationService.sendNoParkingAlert({
        owner,
        tag,
        location: locationData,
        scannerDetails: scannerData,
        scannerNote,
        alertType
      });

      messageToScanner = 'Alert sent directly to the vehicle owner. They have been notified to move or inspect their vehicle.';
    }

    // Save alert history to database
    const alertRecord = await AlertLog.create({
      tag: tag._id,
      tagCode: tag.tagCode,
      user: owner._id,
      alertType,
      status: 'SENT',
      scannerDetails: scannerData,
      location: locationData,
      scannerNote: scannerNote || '',
      notificationsSent: dispatchResult.logs || []
    });

    const cleanOwnerPhone = owner.phone ? owner.phone.replace(/\D/g, '').slice(-10) : '';
    const maskedPhone = cleanOwnerPhone ? `+91 ${cleanOwnerPhone.slice(0, 2)}******${cleanOwnerPhone.slice(-2)}` : null;
    const directCallUrl = cleanOwnerPhone ? `tel:+91${cleanOwnerPhone}` : null;
    const directWhatsAppUrl = dispatchResult.directWhatsAppUrl || (cleanOwnerPhone ? `https://wa.me/91${cleanOwnerPhone}?text=${encodeURIComponent(`Namaste, aapki gaadi (${tag.vehicleDetails?.vehicleNumber || tag.tagCode}) ke liye alert: ${alertType === 'NO_PARKING' ? 'Gaadi No-Parking me hai, kripya hatayein.' : (scannerNote || 'Kripya gaadi check karein.')}`)}` : null);

    res.status(201).json({
      success: true,
      message: messageToScanner,
      alertId: alertRecord._id,
      alertType,
      hasLocation: Boolean(locationData.googleMapsUrl || locationData.address),
      directCallUrl,
      maskedPhone,
      directWhatsAppUrl,
      directFamilyWhatsAppLinks: dispatchResult.directFamilyWhatsAppLinks || [],
      notifiedCount: dispatchResult.logs?.length || 1
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get alert history for the logged-in vehicle owner
 * @route   GET /api/alerts/my-alerts
 * @access  Private
 */
const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await AlertLog.find({ user: req.user._id })
      .populate('tag', 'tagCode vehicleDetails')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark an alert as resolved (e.g. vehicle moved or help arrived)
 * @route   PUT /api/alerts/:id/resolve
 * @access  Private
 */
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await AlertLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: 'Alert marked as resolved',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerAlert,
  getMyAlerts,
  resolveAlert
};
