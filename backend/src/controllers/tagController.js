const QRCode = require('qrcode');
const crypto = require('crypto');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const jwt = require('jsonwebtoken');
const { checkDocumentExpiryStatus } = require('../services/notificationService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gadiraksha_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * @desc    Generate one or multiple physical QR tags with unique IDs for printing stickers (Admin)
 * @route   POST /api/tags/generate or POST /api/tags/batch-generate
 * @access  Private (Admin or Admin-Key)
 */
const batchGenerateTags = async (req, res, next) => {
  try {
    const {
      count = 10,
      prefix = 'MH',
      mode = 'SEQUENTIAL', // 'SEQUENTIAL' | 'RANDOM' | 'CUSTOM'
      startNumber,
      codes = []
    } = req.body;

    const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
    const cleanPrefix = (prefix || 'MH').toUpperCase().trim();
    const tagsCreated = [];
    const skippedCodes = [];

    // Mode 1: Custom predefined list of codes
    if (Array.isArray(codes) && codes.length > 0) {
      for (const rawCode of codes) {
        if (!rawCode || !String(rawCode).trim()) continue;
        const code = String(rawCode).trim().toUpperCase();

        const existing = await Tag.findOne({ tagCode: code });
        if (existing) {
          skippedCodes.push({ code, reason: `Already exists with status: ${existing.status}` });
          continue;
        }

        const scanUrl = `${clientBaseUrl}/scan/${code}`;
        const qrDataUrl = await QRCode.toDataURL(scanUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 350,
          color: { dark: '#000000', light: '#ffffff' }
        });

        const newTag = await Tag.create({
          tagCode: code,
          qrUrl: scanUrl,
          qrImageBase64: qrDataUrl,
          status: 'UNCLAIMED'
        });

        tagsCreated.push({
          _id: newTag._id,
          tagCode: newTag.tagCode,
          qrUrl: newTag.qrUrl,
          qrImageBase64: newTag.qrImageBase64,
          status: newTag.status,
          createdAt: newTag.createdAt
        });
      }
    } else if (mode === 'SEQUENTIAL' || startNumber !== undefined) {
      // Mode 2: Sequential numbering (e.g. MH-1001, MH-1002, ...)
      let currentNum = Number(startNumber);
      if (isNaN(currentNum) || currentNum < 1) {
        const lastTag = await Tag.findOne({ tagCode: new RegExp(`^${cleanPrefix}-\\d+$`) })
          .sort({ createdAt: -1 });
        if (lastTag && lastTag.tagCode) {
          const match = lastTag.tagCode.match(/-(\d+)$/);
          currentNum = match ? Number(match[1]) + 1 : 1001;
        } else {
          currentNum = 1001;
        }
      }

      const totalCount = Math.min(Math.max(1, Number(count) || 1), 500);

      while (tagsCreated.length < totalCount) {
        const candidateCode = `${cleanPrefix}-${currentNum}`;
        currentNum++;

        const existing = await Tag.findOne({ tagCode: candidateCode });
        if (existing) {
          continue;
        }

        const scanUrl = `${clientBaseUrl}/scan/${candidateCode}`;
        const qrDataUrl = await QRCode.toDataURL(scanUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 350,
          color: { dark: '#000000', light: '#ffffff' }
        });

        const newTag = await Tag.create({
          tagCode: candidateCode,
          qrUrl: scanUrl,
          qrImageBase64: qrDataUrl,
          status: 'UNCLAIMED'
        });

        tagsCreated.push({
          _id: newTag._id,
          tagCode: newTag.tagCode,
          qrUrl: newTag.qrUrl,
          qrImageBase64: newTag.qrImageBase64,
          status: newTag.status,
          createdAt: newTag.createdAt
        });
      }
    } else {
      // Mode 3: Random unique codes (e.g. MH-84920)
      const totalCount = Math.min(Math.max(1, Number(count) || 1), 500);

      for (let i = 0; i < totalCount; i++) {
        let unique = false;
        let tagCode = '';
        let attempts = 0;

        while (!unique && attempts < 100) {
          attempts++;
          const randomPart = Math.floor(10000 + Math.random() * 90000);
          tagCode = `${cleanPrefix}-${randomPart}`;
          const existing = await Tag.findOne({ tagCode });
          if (!existing) unique = true;
        }

        const scanUrl = `${clientBaseUrl}/scan/${tagCode}`;
        const qrDataUrl = await QRCode.toDataURL(scanUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 350,
          color: { dark: '#000000', light: '#ffffff' }
        });

        const newTag = await Tag.create({
          tagCode,
          qrUrl: scanUrl,
          qrImageBase64: qrDataUrl,
          status: 'UNCLAIMED'
        });

        tagsCreated.push({
          _id: newTag._id,
          tagCode: newTag.tagCode,
          qrUrl: newTag.qrUrl,
          qrImageBase64: newTag.qrImageBase64,
          status: newTag.status,
          createdAt: newTag.createdAt
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated ${tagsCreated.length} unique scanners ready for physical printing`,
      count: tagsCreated.length,
      prefix: cleanPrefix,
      skippedCount: skippedCodes.length,
      skippedCodes: skippedCodes.length > 0 ? skippedCodes : undefined,
      data: tagsCreated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    1-Step: Register new user + Claim sticker + Add 3-4 Family Contacts + Vehicle Docs
 * @route   POST /api/tags/register-and-claim
 * @access  Public
 */
const registerAndClaim = async (req, res, next) => {
  try {
    const {
      tagCode,
      name,
      phone,
      password,
      profilePic,
      gender,
      bloodGroup,
      weight,
      height,
      address,
      medicalNotes,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleColor,
      emergencyContacts, // Array of 3-4 contacts [{ name, relation, phone }]
      puc, // { docNumber, validUntil, documentUrl }
      insurance, // { docNumber, companyName, validUntil }
      purchaseInfo // { isPaid, amountPaid, plan }
    } = req.body;

    if (!tagCode || !name || !phone || !password || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tagCode, name, phone, password, and vehicleNumber are required.'
      });
    }

    const cleanTagCode = tagCode.trim().toUpperCase();
    let tag = await Tag.findOne({ tagCode: cleanTagCode });

    // Pre-printed Physical Scanner support:
    // If the scanner sticker was pre-printed before being in DB, auto-create it as UNCLAIMED
    if (!tag) {
      const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
      tag = new Tag({
        tagCode: cleanTagCode,
        qrUrl: `${clientBaseUrl}/scan/${cleanTagCode}`,
        status: 'UNCLAIMED'
      });
    }

    if (tag.status === 'ACTIVE' && tag.user) {
      return res.status(400).json({
        success: false,
        message: 'This sticker has already been activated by another user.'
      });
    }

    // Process 3-4 emergency contacts
    let contactsList = [];
    if (Array.isArray(emergencyContacts)) {
      contactsList = emergencyContacts.slice(0, 5).map((c, index) => ({
        name: c.name,
        relation: c.relation || 'Relative',
        phone: c.phone,
        priorityOrder: index + 1,
        isPrimary: index === 0
      }));
    }

    const formattedAddress = typeof address === 'string'
      ? { fullAddress: address, city: '', state: 'Maharashtra', pincode: '' }
      : (address || {});

    // Check or create user with new demographics (gender, weight, height, address, profilePic)
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name,
        phone,
        password,
        profilePic: profilePic || undefined,
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'Unknown',
        weight: weight ? Number(weight) : null,
        height: height || '',
        address: formattedAddress,
        medicalNotes: medicalNotes || '',
        emergencyContacts: contactsList
      });
    } else {
      // If user exists, update their profile with any provided details
      if (gender) user.gender = gender;
      if (bloodGroup) user.bloodGroup = bloodGroup;
      if (weight) user.weight = Number(weight);
      if (height) user.height = height;
      if (profilePic) user.profilePic = profilePic;
      if (address) user.address = formattedAddress;
      if (contactsList.length > 0) user.emergencyContacts = contactsList;
      await user.save();
    }

    // Attach tag
    tag.user = user._id;
    tag.status = 'ACTIVE';
    tag.claimedAt = new Date();
    tag.vehicleDetails = {
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType: vehicleType || 'Four-Wheeler',
      vehicleModel: vehicleModel || '',
      vehicleColor: vehicleColor || ''
    };

    // Record purchase and validity (e.g. 1 year subscription)
    tag.purchaseInfo = {
      isPaid: purchaseInfo?.isPaid !== false,
      paymentStatus: purchaseInfo?.paymentStatus || 'PAID',
      plan: purchaseInfo?.plan || '1_YEAR_STANDARD',
      amountPaid: purchaseInfo?.amountPaid || 299,
      purchasedAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    // Save initial vehicle documents if provided
    if (puc && puc.docNumber) {
      tag.documents.puc = {
        docNumber: puc.docNumber,
        validUntil: puc.validUntil ? new Date(puc.validUntil) : null,
        documentUrl: puc.documentUrl || ''
      };
    }

    if (insurance && insurance.docNumber) {
      tag.documents.insurance = {
        docNumber: insurance.docNumber,
        companyName: insurance.companyName || '',
        validUntil: insurance.validUntil ? new Date(insurance.validUntil) : null,
        documentUrl: insurance.documentUrl || ''
      };
    }

    await tag.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created, vehicle documents saved, and sticker activated successfully!',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          bloodGroup: user.bloodGroup,
          emergencyContacts: user.emergencyContacts
        },
        tag,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle documents (PUC, Insurance, RC, Fitness)
 * @route   PUT /api/tags/:tagCode/documents
 * @access  Private (Vehicle Owner)
 */
const updateVehicleDocuments = async (req, res, next) => {
  try {
    const { tagCode } = req.params;
    const { puc, insurance, rc, fitness, showDocsOnScan } = req.body;

    const tag = await Tag.findOne({ tagCode: tagCode.toUpperCase(), user: req.user._id });
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found or unauthorized' });
    }

    // Update PUC
    if (puc) {
      tag.documents.puc = {
        docNumber: puc.docNumber || tag.documents.puc?.docNumber || '',
        validUntil: puc.validUntil ? new Date(puc.validUntil) : tag.documents.puc?.validUntil,
        documentUrl: puc.documentUrl || tag.documents.puc?.documentUrl || ''
      };
    }

    // Update Insurance
    if (insurance) {
      tag.documents.insurance = {
        docNumber: insurance.docNumber || tag.documents.insurance?.docNumber || '',
        companyName: insurance.companyName || tag.documents.insurance?.companyName || '',
        validUntil: insurance.validUntil ? new Date(insurance.validUntil) : tag.documents.insurance?.validUntil,
        documentUrl: insurance.documentUrl || tag.documents.insurance?.documentUrl || ''
      };
    }

    // Update RC
    if (rc) {
      tag.documents.rc = {
        docNumber: rc.docNumber || tag.documents.rc?.docNumber || '',
        validUntil: rc.validUntil ? new Date(rc.validUntil) : tag.documents.rc?.validUntil,
        documentUrl: rc.documentUrl || tag.documents.rc?.documentUrl || ''
      };
    }

    // Update Fitness
    if (fitness) {
      tag.documents.fitness = {
        docNumber: fitness.docNumber || tag.documents.fitness?.docNumber || '',
        validUntil: fitness.validUntil ? new Date(fitness.validUntil) : tag.documents.fitness?.validUntil,
        documentUrl: fitness.documentUrl || tag.documents.fitness?.documentUrl || ''
      };
    }

    if (showDocsOnScan !== undefined) {
      tag.privacySettings.showDocsOnScan = showDocsOnScan;
    }

    await tag.save();

    const expiryStatus = checkDocumentExpiryStatus(tag.documents);

    res.json({
      success: true,
      message: 'Vehicle documents updated successfully',
      data: {
        documents: tag.documents,
        showDocsOnScan: tag.privacySettings.showDocsOnScan,
        documentExpiryStatus: expiryStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record or update purchase / subscription payment status
 * @route   PUT /api/tags/:tagCode/purchase
 * @access  Private (Admin or Authenticated Owner on Payment Gateway success)
 */
const updatePurchaseStatus = async (req, res, next) => {
  try {
    const { tagCode } = req.params;
    const { isPaid, paymentStatus, plan, amountPaid, transactionId, validityMonths = 12 } = req.body;

    const tag = await Tag.findOne({ tagCode: tagCode.toUpperCase() });
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    const now = new Date();
    const validUntilDate = new Date(now.getTime() + validityMonths * 30 * 24 * 60 * 60 * 1000);

    tag.purchaseInfo = {
      isPaid: isPaid !== false,
      paymentStatus: paymentStatus || 'PAID',
      plan: plan || '1_YEAR_STANDARD',
      amountPaid: amountPaid !== undefined ? Number(amountPaid) : tag.purchaseInfo.amountPaid,
      purchasedAt: now,
      validUntil: validUntilDate,
      transactionId: transactionId || `TXN-${Date.now()}`
    };

    await tag.save();

    res.json({
      success: true,
      message: `Purchase status updated for tag ${tag.tagCode}`,
      data: tag.purchaseInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's vehicle tags with document status & purchase info
 * @route   GET /api/tags/my-tags
 * @access  Private
 */
const getMyTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({ user: req.user._id }).sort({ createdAt: -1 });

    const enriched = tags.map((t) => {
      const docExpiry = checkDocumentExpiryStatus(t.documents);
      const isSubActive = t.purchaseInfo?.isPaid && (!t.purchaseInfo.validUntil || new Date() <= new Date(t.purchaseInfo.validUntil));
      return {
        ...t.toObject(),
        isSubscriptionActive: isSubActive,
        documentExpiryStatus: docExpiry
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Buy new QR scanner(s) (Authenticated User)
 * @route   POST /api/tags/buy or POST /api/tags/purchase
 * @access  Private
 */
const buyScanner = async (req, res, next) => {
  try {
    const {
      plan = '1_YEAR_STANDARD',
      quantity = 1,
      prefix = 'MH',
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleColor,
      deliveryAddress,
      paymentMode = 'UPI'
    } = req.body;

    const count = Math.min(Math.max(1, Number(quantity) || 1), 10);
    const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
    const cleanPrefix = (prefix || 'MH').toUpperCase().trim();

    // Determine plan pricing
    let pricePerSticker = 299;
    let planName = '1_YEAR_STANDARD';
    let validityDays = 365;

    if (plan === 'family' || plan === 'FAMILY_PACK') {
      planName = 'FAMILY_PACK';
      pricePerSticker = 233; // 699 for 3 stickers (~233 each)
    } else if (plan === 'pro_3yr' || plan === '3_YEAR_PRO') {
      planName = '3_YEAR_PRO';
      pricePerSticker = 699;
      validityDays = 365 * 3;
    } else if (plan === 'lifetime' || plan === 'LIFETIME') {
      planName = 'LIFETIME';
      pricePerSticker = 999;
      validityDays = 365 * 10;
    }

    const totalAmount = pricePerSticker * count;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If delivery address provided, update user address
    if (deliveryAddress && String(deliveryAddress).trim()) {
      if (typeof user.address === 'object' && user.address !== null) {
        user.address.fullAddress = String(deliveryAddress).trim();
      } else {
        user.address = { fullAddress: String(deliveryAddress).trim() };
      }
      await user.save();
    }

    // Check if user has an existing vehicle or wants to link this one
    let targetVehicle = null;
    if (vehicleNumber && String(vehicleNumber).trim()) {
      const cleanVNum = String(vehicleNumber).toUpperCase().trim().replace(/\s+/g, ' ');
      targetVehicle = await Vehicle.findOne({ user: user._id, vehicleNumber: cleanVNum });
      if (!targetVehicle) {
        targetVehicle = await Vehicle.create({
          user: user._id,
          vehicleNumber: cleanVNum,
          vehicleType: vehicleType || 'Two-Wheeler',
          vehicleModel: vehicleModel || '',
          vehicleColor: vehicleColor || '',
          isPrimary: !user.primaryVehicle
        });
        user.vehicles.push(targetVehicle._id);
        if (!user.primaryVehicle) {
          user.primaryVehicle = targetVehicle._id;
        }
        await user.save();
      }
    }

    const purchasedTags = [];
    const transactionId = `TXN-GR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    for (let i = 0; i < count; i++) {
      let unique = false;
      let candidateCode = '';

      // Auto-increment from next available sequential number
      const lastTag = await Tag.findOne({ tagCode: new RegExp(`^${cleanPrefix}-\\d+$`) })
        .sort({ createdAt: -1 });
      let nextNum = 1001;
      if (lastTag && lastTag.tagCode) {
        const match = lastTag.tagCode.match(/-(\d+)$/);
        if (match) nextNum = Number(match[1]) + 1 + i;
      } else {
        nextNum = 1001 + i;
      }

      while (!unique) {
        candidateCode = `${cleanPrefix}-${nextNum}`;
        const existing = await Tag.findOne({ tagCode: candidateCode });
        if (!existing) {
          unique = true;
        } else {
          nextNum++;
        }
      }

      const scanUrl = `${clientBaseUrl}/scan/${candidateCode}`;
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 350,
        color: { dark: '#000000', light: '#ffffff' }
      });

      const vehicleToLink = (i === 0 && targetVehicle) ? targetVehicle : null;

      const newTag = await Tag.create({
        tagCode: candidateCode,
        qrUrl: scanUrl,
        qrImageBase64: qrDataUrl,
        status: 'ACTIVE',
        user: user._id,
        vehicle: vehicleToLink ? vehicleToLink._id : null,
        vehicleDetails: {
          vehicleNumber: vehicleToLink ? vehicleToLink.vehicleNumber : (vehicleNumber ? String(vehicleNumber).toUpperCase().trim() : ''),
          vehicleType: vehicleToLink ? vehicleToLink.vehicleType : (vehicleType || 'Two-Wheeler'),
          vehicleModel: vehicleToLink ? vehicleToLink.vehicleModel : (vehicleModel || ''),
          vehicleColor: vehicleToLink ? vehicleToLink.vehicleColor : (vehicleColor || '')
        },
        claimedAt: new Date(),
        purchaseInfo: {
          isPaid: true,
          paymentStatus: 'PAID',
          plan: planName,
          amountPaid: pricePerSticker,
          purchasedAt: new Date(),
          validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
          transactionId
        }
      });

      if (vehicleToLink) {
        vehicleToLink.tag = newTag._id;
        vehicleToLink.tagCode = newTag.tagCode;
        await vehicleToLink.save();
      }

      purchasedTags.push(newTag);
    }

    res.status(201).json({
      success: true,
      message: `🎉 Success! Purchased and generated ${purchasedTags.length} GadiRaksha Smart QR Scanner(s)!`,
      order: {
        transactionId,
        plan: planName,
        totalAmount,
        paymentMode,
        stickerCount: purchasedTags.length,
        deliveryAddress: deliveryAddress || user.address?.fullAddress || 'Registered Address'
      },
      data: purchasedTags
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Claim an existing tag (for logged in user)
 * @route   POST /api/tags/claim
 * @access  Private
 */
const claimTag = async (req, res, next) => {
  try {
    const { tagCode, vehicleNumber, vehicleType, vehicleModel, vehicleColor } = req.body;

    if (!tagCode || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Tag Code and Vehicle Number'
      });
    }

    const cleanTagCode = tagCode.trim().toUpperCase();
    let tag = await Tag.findOne({ tagCode: cleanTagCode });

    // Support pre-printed physical scanners not yet in database
    if (!tag) {
      const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
      tag = new Tag({
        tagCode: cleanTagCode,
        qrUrl: `${clientBaseUrl}/scan/${cleanTagCode}`,
        status: 'UNCLAIMED'
      });
    }

    if (tag.status === 'ACTIVE' && tag.user && String(tag.user) !== String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: `This sticker code "${cleanTagCode}" is already claimed and registered to another vehicle.`
      });
    }

    // Find or create Vehicle for this user in Vehicle collection
    const cleanVNum = vehicleNumber.toUpperCase().trim().replace(/\s+/g, ' ');
    let vehicle = await Vehicle.findOne({
      user: req.user._id,
      vehicleNumber: cleanVNum
    });

    const user = await User.findById(req.user._id);

    if (!vehicle) {
      vehicle = await Vehicle.create({
        user: req.user._id,
        vehicleNumber: cleanVNum,
        vehicleType: vehicleType || 'Two-Wheeler',
        vehicleModel: vehicleModel || '',
        vehicleColor: vehicleColor || '',
        tagCode: cleanTagCode,
        isPrimary: !user?.primaryVehicle
      });

      if (user) {
        user.vehicles.push(vehicle._id);
        if (!user.primaryVehicle) {
          user.primaryVehicle = vehicle._id;
        }
        await user.save();
      }
    } else {
      vehicle.tagCode = cleanTagCode;
    }

    tag.user = req.user._id;
    tag.vehicle = vehicle._id;
    tag.status = 'ACTIVE';
    tag.claimedAt = new Date();
    tag.vehicleDetails = {
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType || vehicleType || 'Two-Wheeler',
      vehicleModel: vehicle.vehicleModel || vehicleModel || '',
      vehicleColor: vehicle.vehicleColor || vehicleColor || ''
    };

    tag.purchaseInfo = {
      isPaid: true,
      paymentStatus: 'PAID',
      plan: '1_YEAR_STANDARD',
      amountPaid: 299,
      purchasedAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    await tag.save();

    vehicle.tag = tag._id;
    await vehicle.save();

    res.json({
      success: true,
      message: `Scanner ${tag.tagCode} successfully assigned to vehicle ${vehicle.vehicleNumber}!`,
      data: {
        tag,
        vehicle
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if a physical sticker code is valid and available for first-time claiming
 * @route   GET /api/tags/check/:tagCode
 * @access  Public
 */
const checkTagAvailability = async (req, res, next) => {
  try {
    const { tagCode } = req.params;
    if (!tagCode || !tagCode.trim()) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Please provide a valid sticker code'
      });
    }

    const cleanTagCode = tagCode.trim().toUpperCase();
    const tag = await Tag.findOne({ tagCode: cleanTagCode });

    if (!tag || tag.status === 'UNCLAIMED' || !tag.user) {
      return res.json({
        success: true,
        available: true,
        isFirstTimeScan: true,
        tagCode: cleanTagCode,
        status: tag ? tag.status : 'UNCLAIMED',
        message: `Sticker "${cleanTagCode}" is fresh and available! On your first scan/registration, it will belong exclusively to your vehicle.`
      });
    }

    if (tag.status === 'ACTIVE' && tag.user) {
      return res.json({
        success: false,
        available: false,
        isFirstTimeScan: false,
        tagCode: cleanTagCode,
        status: 'CLAIMED',
        message: `This unique sticker code "${cleanTagCode}" has already been claimed by another vehicle owner.`
      });
    }

    return res.json({
      success: false,
      available: false,
      tagCode: cleanTagCode,
      status: tag.status,
      message: `Sticker code "${cleanTagCode}" is currently ${tag.status.toLowerCase()}.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  batchGenerateTags,
  registerAndClaim,
  updateVehicleDocuments,
  updatePurchaseStatus,
  getMyTags,
  claimTag,
  buyScanner,
  checkTagAvailability
};
