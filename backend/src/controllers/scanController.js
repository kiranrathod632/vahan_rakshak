const Tag = require('../models/Tag');
const User = require('../models/User');
const { checkDocumentExpiryStatus } = require('../services/notificationService');
const { getClientBaseUrl } = require('../utils/urlHelper');

/**
 * Mask vehicle number for privacy if enabled (e.g. MH19AB1234 -> MH19 ** 1234)
 */
const maskVehicleNumber = (plate) => {
  if (!plate || plate.length < 8) return plate;
  const clean = plate.replace(/\s+/g, '');
  return `${clean.slice(0, 4)} ** ${clean.slice(-4)}`;
};

/**
 * @desc    Public endpoint when someone scans a vehicle QR code
 * @route   GET /api/scan/:tagCode
 * @access  Public
 */
const getTagScanInfo = async (req, res, next) => {
  try {
    const { tagCode } = req.params;
    const cleanTagCode = tagCode.trim().toUpperCase();

    let tag = await Tag.findOne({ tagCode: cleanTagCode })
      .populate('user', 'name phone profilePic gender bloodGroup weight height address medicalNotes emergencyContacts');

    // Pre-printed Scanner Auto-Discovery:
    // If the physical QR sticker was pre-printed and scanned for the very first time
    if (!tag) {
      const clientBaseUrl = getClientBaseUrl(req);
      tag = await Tag.create({
        tagCode: cleanTagCode,
        qrUrl: `${clientBaseUrl}/scan/${cleanTagCode}`,
        status: 'UNCLAIMED'
      });
    }

    // First time scan of pre-printed physical scanner -> opens registration
    if (tag.status === 'UNCLAIMED' || !tag.user) {
      return res.json({
        success: true,
        status: 'UNCLAIMED',
        isFirstTimeScan: true,
        tagCode: tag.tagCode,
        message: 'This GadiRaksha pre-printed sticker is fresh! Please fill in your details to activate and claim this scanner.',
        action: 'SHOW_REGISTRATION_FORM',
        claimUrl: `/claim/${tag.tagCode}`
      });
    }

    if (tag.status !== 'ACTIVE' || !tag.user) {
      return res.status(403).json({
        success: false,
        status: tag.status,
        message: 'This safety sticker is currently inactive or suspended.'
      });
    }

    // Check subscription status
    const isSubActive = tag.purchaseInfo?.isPaid && (!tag.purchaseInfo.validUntil || new Date() <= new Date(tag.purchaseInfo.validUntil));

    // Increment scan count
    Tag.findByIdAndUpdate(tag._id, { $inc: { totalScans: 1 } }).exec();

    // Prepare display vehicle number
    const rawPlate = tag.vehicleDetails?.vehicleNumber || '';
    const displayPlate = tag.privacySettings?.maskVehicleNumber
      ? maskVehicleNumber(rawPlate)
      : rawPlate;

    const familyContacts = tag.user.emergencyContacts || [];

    // Document status for traffic police / owner check if enabled
    let verifiedDocuments = null;
    if (tag.privacySettings?.showDocsOnScan) {
      const docExpiry = checkDocumentExpiryStatus(tag.documents);
      verifiedDocuments = {
        puc: {
          docNumber: tag.documents?.puc?.docNumber || null,
          validUntil: tag.documents?.puc?.validUntil || null,
          status: docExpiry.puc.status
        },
        insurance: {
          companyName: tag.documents?.insurance?.companyName || null,
          policyNumber: tag.documents?.insurance?.docNumber || null,
          validUntil: tag.documents?.insurance?.validUntil || null,
          status: docExpiry.insurance.status
        }
      };
    }

    res.json({
      success: true,
      status: 'ACTIVE',
      tagCode: tag.tagCode,
      subscription: {
        isActive: isSubActive,
        validUntil: tag.purchaseInfo?.validUntil || null
      },
      vehicle: {
        number: displayPlate,
        type: tag.vehicleDetails?.vehicleType || 'Vehicle',
        model: tag.vehicleDetails?.vehicleModel || '',
        color: tag.vehicleDetails?.vehicleColor || ''
      },
      verifiedDocuments,
      medicalSupport: {
        profilePic: tag.user.profilePic || null,
        ownerName: tag.user.name,
        gender: tag.user.gender || 'Not specified',
        bloodGroup: tag.user.bloodGroup || 'Unknown',
        weight: tag.user.weight ? `${tag.user.weight} kg` : null,
        height: tag.user.height || null,
        hasMedicalNotes: Boolean(tag.user.medicalNotes),
        medicalNotes: tag.user.medicalNotes || ''
      },
      emergencyReady: {
        familyContactsLinked: familyContacts.length > 0,
        contactsCount: familyContacts.length,
        // Safe preview of relations without revealing phone numbers publicly
        contactRelations: familyContacts.map(c => c.relation)
      },
      ownerContact: {
        canCall: Boolean(tag.user?.phone),
        directCallUrl: tag.user?.phone ? `tel:+91${tag.user.phone.replace(/\D/g, '').slice(-10)}` : null,
        maskedPhone: tag.user?.phone ? `+91 ${tag.user.phone.slice(0, 2)}******${tag.user.phone.slice(-2)}` : null,
        directWhatsAppUrl: tag.user?.phone ? `https://wa.me/91${tag.user.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Namaste, aapki gaadi (${displayPlate || tag.tagCode}) No-Parking me hai ya rasta rok rahi hai. Kripya ise check karein.`)}` : null
      },
      availableActions: [
        {
          id: 'NO_PARKING',
          title: '🚫 No-Parking / Vehicle Blocking (गाडी नो-पार्किंग)',
          marathiTitle: 'गाडी नो-पार्किंग किंवा रस्ता अडवत आहे',
          description: 'Instantly calls & notifies owner via Socket, SMS & WhatsApp to move vehicle',
          target: 'OWNER'
        },
        {
          id: 'ACCIDENT',
          title: '🆘 Accident / Medical Emergency (अपघात / SOS)',
          marathiTitle: 'अपघात / आणीबाणी (तातडीने मदत)',
          description: `Immediately alerts owner + ${familyContacts.length} family members via Calls, SMS & WhatsApp with GPS location`,
          target: 'FAMILY_AND_OWNER',
          priority: 'CRITICAL'
        },
        {
          id: 'LIGHTS_ON',
          title: '💡 Headlights ON / Window Open / Flat Tyre (लाईट/टायर/खिडकी)',
          marathiTitle: 'गाडीचे दिवे चालू / टायर पंचर / खिडकी उघडी',
          description: 'Notifies vehicle owner about battery drain, flat tyre or open window',
          target: 'OWNER'
        },
        {
          id: 'TOW_WARNING',
          title: '⚠️ Towing Alert / Police Crane (टोईंग क्रेन / चालान)',
          marathiTitle: 'ट्रॅफिक पोलीस किंवा क्रेन गाडी उचलत आहे',
          description: 'Urgent alarm to owner before vehicle is towed away',
          target: 'OWNER',
          priority: 'URGENT'
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTagScanInfo };
