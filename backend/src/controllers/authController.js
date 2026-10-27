const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Tag = require('../models/Tag');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gadiraksha_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * @desc    Register a new vehicle owner user with separate Vehicle model creation
 * @route   POST /api/auth/register or POST /auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      phone,
      password,
      confirmPassword,
      name,
      email,
      profilePic,
      gender,
      bloodGroup,
      weight,
      height,
      address,
      medicalNotes,
      emergencyContacts,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      // Optional Vehicle Details (if user wants to add immediately or later)
      vehicleDetails,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleColor,
      tagCode,
      pucNumber,
      pucValidUntil,
      insuranceNumber,
      insuranceCompany,
      insuranceValidUntil
    } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and password to register'
      });
    }

    const cleanPhone = String(phone || '').trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Verify confirm password if provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please ensure password and confirmPassword are the same.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ phone: cleanPhone });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please login.'
      });
    }

    // Check if email already registered
    if (email && email.trim()) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }
    }

    const formattedAddress = typeof address === 'string'
      ? { fullAddress: address, city: '', state: 'Maharashtra', pincode: '' }
      : (address || {});

    // Parse emergency contacts (handles both array and single fields)
    let parsedContacts = [];
    if (Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
      parsedContacts = emergencyContacts
        .filter(c => c && c.name && c.phone)
        .map((c, i) => ({
          name: c.name.trim(),
          relation: c.relation || 'Relative',
          phone: String(c.phone).trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, ''),
          isPrimary: c.isPrimary !== undefined ? c.isPrimary : (i === 0),
          priorityOrder: i + 1
        }));
    } else if (emergencyContactName && emergencyContactPhone) {
      parsedContacts.push({
        name: emergencyContactName.trim(),
        relation: emergencyContactRelation || 'Father',
        phone: String(emergencyContactPhone).trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, ''),
        isPrimary: true,
        priorityOrder: 1
      });
    }

    // Verify physical sticker code uniqueness if provided
    const providedTagCode = (vehicleDetails?.tagCode || tagCode || '').toUpperCase().trim();
    let existingTagForValidation = null;
    if (providedTagCode) {
      existingTagForValidation = await Tag.findOne({ tagCode: providedTagCode });
      if (existingTagForValidation && existingTagForValidation.status === 'ACTIVE' && existingTagForValidation.user) {
        return res.status(400).json({
          success: false,
          message: `Physical sticker code "${providedTagCode}" is already claimed by another user. Each QR sticker has a unique code.`
        });
      }
    }

    // 1. Create the User in User collection (Quick registration with phone & password)
    const user = await User.create({
      name: name ? name.trim() : '',
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : null,
      password,
      profilePic: profilePic || undefined,
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'Unknown',
      weight: weight ? Number(weight) : null,
      height: height || '',
      address: formattedAddress,
      medicalNotes: medicalNotes || '',
      emergencyContacts: parsedContacts,
      role: 'user',
      status: 'ACTIVE'
    });

    // 2. Check if Vehicle Details provided -> Create in separate Vehicle Collection
    let createdVehicle = null;
    let linkedTag = null;
    const vNum = vehicleDetails?.vehicleNumber || vehicleNumber;

    if (vNum && vNum.trim()) {
      const cleanVNum = vNum.toUpperCase().trim().replace(/\s+/g, ' ');
      const cleanTagCode = (vehicleDetails?.tagCode || tagCode || '').toUpperCase().trim();

      createdVehicle = await Vehicle.create({
        user: user._id, // User ID reference
        vehicleNumber: cleanVNum,
        vehicleType: vehicleDetails?.vehicleType || vehicleType || 'Two-Wheeler',
        vehicleModel: vehicleDetails?.vehicleModel || vehicleModel || '',
        vehicleColor: vehicleDetails?.vehicleColor || vehicleColor || '',
        tagCode: cleanTagCode,
        puc: {
          pucNumber: vehicleDetails?.pucNumber || pucNumber || '',
          validUntil: (vehicleDetails?.pucValidUntil || pucValidUntil) ? new Date(vehicleDetails?.pucValidUntil || pucValidUntil) : null
        },
        insurance: {
          insuranceNumber: vehicleDetails?.insuranceNumber || insuranceNumber || '',
          insuranceCompany: vehicleDetails?.insuranceCompany || insuranceCompany || '',
          validUntil: (vehicleDetails?.insuranceValidUntil || insuranceValidUntil) ? new Date(vehicleDetails?.insuranceValidUntil || insuranceValidUntil) : null
        },
        isPrimary: true
      });

      // Update user with reference to the newly created Vehicle
      user.primaryVehicle = createdVehicle._id;
      user.vehicles.push(createdVehicle._id);
      await user.save();

      // If a QR sticker code was provided, link the Tag in database
      if (cleanTagCode) {
        linkedTag = existingTagForValidation || await Tag.findOne({ tagCode: cleanTagCode });

        if (!linkedTag) {
          const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
          linkedTag = new Tag({
            tagCode: cleanTagCode,
            qrUrl: `${clientBaseUrl}/scan/${cleanTagCode}`,
            status: 'UNCLAIMED'
          });
        }

        // Permanent assignment on first registration / claim
        linkedTag.user = user._id;
        linkedTag.vehicle = createdVehicle._id;
        linkedTag.status = 'ACTIVE';
        linkedTag.claimedAt = new Date();
        linkedTag.vehicleDetails = {
          vehicleNumber: createdVehicle.vehicleNumber,
          vehicleType: createdVehicle.vehicleType,
          vehicleModel: createdVehicle.vehicleModel,
          vehicleColor: createdVehicle.vehicleColor
        };

        if (createdVehicle.puc?.pucNumber) {
          linkedTag.documents.puc = {
            docNumber: createdVehicle.puc.pucNumber,
            validUntil: createdVehicle.puc.validUntil
          };
        }

        if (createdVehicle.insurance?.insuranceNumber) {
          linkedTag.documents.insurance = {
            docNumber: createdVehicle.insurance.insuranceNumber,
            companyName: createdVehicle.insurance.insuranceCompany,
            validUntil: createdVehicle.insurance.validUntil
          };
        }

        await linkedTag.save();

        createdVehicle.tag = linkedTag._id;
        await createdVehicle.save();
      }
    } else if (providedTagCode) {
      // If tagCode provided without vehicleNumber yet, bind the QR scanner to this user
      linkedTag = existingTagForValidation || await Tag.findOne({ tagCode: providedTagCode });

      if (!linkedTag) {
        const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
        linkedTag = new Tag({
          tagCode: providedTagCode,
          qrUrl: `${clientBaseUrl}/scan/${providedTagCode}`,
          status: 'UNCLAIMED'
        });
      }

      linkedTag.user = user._id;
      linkedTag.status = 'ACTIVE';
      linkedTag.claimedAt = new Date();
      await linkedTag.save();
    }

    const token = generateToken(user._id);

    // Fetch freshly populated user object
    const fullUser = await User.findById(user._id)
      .populate('primaryVehicle')
      .populate('vehicles');

    const userResponse = fullUser ? fullUser.toObject() : user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to GadiRaksha.',
      data: {
        ...userResponse,
        vehicle: createdVehicle,
        linkedTag: linkedTag ? {
          tagCode: linkedTag.tagCode,
          status: linkedTag.status
        } : null,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user with phone & password
 * @route   POST /api/auth/login or POST /auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and password'
      });
    }

    const cleanPhone = String(phone || '').trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');

    const user = await User.findOne({ phone: cleanPhone })
      .select('+password')
      .populate('primaryVehicle')
      .populate('vehicles');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        ...userObj,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile, vehicles & linked vehicle tags
 * @route   GET /api/auth/profile or GET /auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('primaryVehicle')
      .populate('vehicles');

    const tags = await Tag.find({ user: req.user._id }).populate('vehicle');

    res.json({
      success: true,
      data: {
        user,
        tags
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new vehicle to the separate Vehicle collection for this user
 * @route   POST /api/auth/vehicles or POST /auth/vehicles
 * @access  Private
 */
const addVehicle = async (req, res, next) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleColor,
      tagCode,
      pucNumber,
      pucValidUntil,
      insuranceNumber,
      insuranceCompany,
      insuranceValidUntil
    } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      });
    }

    const user = await User.findById(req.user._id);
    let cleanTagCode = (tagCode || '').toUpperCase().trim();
    if (!cleanTagCode) {
      const pendingTag = await Tag.findOne({ user: user._id, vehicle: null, status: 'ACTIVE' });
      if (pendingTag) {
        cleanTagCode = pendingTag.tagCode;
      }
    }

    // Create in separate Vehicle model
    const newVehicle = await Vehicle.create({
      user: req.user._id, // User ID reference
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType: vehicleType || 'Two-Wheeler',
      vehicleModel: vehicleModel || '',
      vehicleColor: vehicleColor || '',
      tagCode: cleanTagCode,
      puc: {
        pucNumber: pucNumber || '',
        validUntil: pucValidUntil ? new Date(pucValidUntil) : null
      },
      insurance: {
        insuranceNumber: insuranceNumber || '',
        insuranceCompany: insuranceCompany || '',
        validUntil: insuranceValidUntil ? new Date(insuranceValidUntil) : null
      },
      isPrimary: user.vehicles.length === 0
    });

    user.vehicles.push(newVehicle._id);
    if (!user.primaryVehicle) {
      user.primaryVehicle = newVehicle._id;
    }
    await user.save();

    // Link tag if tagCode provided
    if (cleanTagCode) {
      let tag = await Tag.findOne({ tagCode: cleanTagCode });
      if (tag && tag.status === 'ACTIVE' && tag.user && String(tag.user) !== String(user._id)) {
        return res.status(400).json({
          success: false,
          message: `Sticker code "${cleanTagCode}" is already claimed by another vehicle owner.`
        });
      }
      if (!tag) {
        const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';
        tag = new Tag({
          tagCode: cleanTagCode,
          qrUrl: `${clientBaseUrl}/scan/${cleanTagCode}`,
          status: 'UNCLAIMED'
        });
      }
      tag.user = user._id;
      tag.vehicle = newVehicle._id;
      tag.status = 'ACTIVE';
      tag.claimedAt = new Date();
      tag.vehicleDetails = {
        vehicleNumber: newVehicle.vehicleNumber,
        vehicleType: newVehicle.vehicleType,
        vehicleModel: newVehicle.vehicleModel,
        vehicleColor: newVehicle.vehicleColor
      };
      await tag.save();

      newVehicle.tag = tag._id;
      await newVehicle.save();
    }

    res.status(201).json({
      success: true,
      message: `Vehicle ${newVehicle.vehicleNumber} added successfully into Vehicle collection`,
      data: newVehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all vehicles belonging to the logged-in user
 * @route   GET /api/auth/vehicles or GET /auth/vehicles
 * @access  Private
 */
const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id }).populate('tag');
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile or PUT /auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      profilePic,
      gender,
      bloodGroup,
      weight,
      height,
      address,
      medicalNotes,
      emergencyContacts
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (profilePic) user.profilePic = profilePic;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (weight !== undefined) user.weight = weight ? Number(weight) : null;
    if (height !== undefined) user.height = height;
    if (medicalNotes !== undefined) user.medicalNotes = medicalNotes;

    if (address) {
      if (typeof address === 'string') {
        user.address.fullAddress = address;
      } else {
        user.address = { ...user.address, ...address };
      }
    }

    if (emergencyContacts && Array.isArray(emergencyContacts)) {
      user.emergencyContacts = emergencyContacts;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a family emergency contact
 * @route   POST /api/auth/emergency-contacts
 * @access  Private
 */
const addEmergencyContact = async (req, res, next) => {
  try {
    const { name, relation, phone, isPrimary, priorityOrder } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required for emergency contact'
      });
    }

    const user = await User.findById(req.user._id);

    if (isPrimary) {
      user.emergencyContacts.forEach((c) => (c.isPrimary = false));
    }

    user.emergencyContacts.push({
      name,
      relation: relation || 'Relative',
      phone,
      isPrimary: isPrimary || false,
      priorityOrder: priorityOrder || (user.emergencyContacts.length + 1)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Emergency family contact added successfully',
      data: user.emergencyContacts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a family emergency contact
 * @route   DELETE /api/auth/emergency-contacts/:contactId
 * @access  Private
 */
const deleteEmergencyContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const user = await User.findById(req.user._id);

    user.emergencyContacts = user.emergencyContacts.filter(
      (c) => c._id.toString() !== contactId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact removed successfully',
      data: user.emergencyContacts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  addVehicle,
  getMyVehicles,
  addEmergencyContact,
  deleteEmergencyContact
};
