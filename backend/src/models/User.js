const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  relation: {
    type: String,
    enum: ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Friend', 'Relative', 'Other'],
    default: 'Relative'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  hasWhatsapp: {
    type: Boolean,
    default: true
  },
  priorityOrder: {
    type: Number,
    default: 1
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Owner primary phone number is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'sales', 'marketing', 'support', 'superadmin'],
    default: 'user'
  },
  department: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  monthlyTarget: {
    type: Number,
    default: 50
  },
  totalSalesCount: {
    type: Number,
    default: 0
  },
  totalCommissionEarned: {
    type: Number,
    default: 0
  },
  salaryOrCommissionRate: {
    type: Number,
    default: 100 // Commission per activated sticker (in Rs)
  },
  baseSalary: {
    type: Number,
    default: 15000 // Base monthly salary in Rs
  },
  incentivePerScanner: {
    type: Number,
    default: 100 // Incentive per activated scanner in Rs
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  profilePic: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Male'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  weight: {
    type: Number, // in kg
    default: null
  },
  height: {
    type: String, // e.g. "5 ft 8 in"
    default: ''
  },
  address: {
    fullAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: 'Maharashtra' },
    pincode: { type: String, default: '' }
  },
  // References to the separate Vehicle collection
  primaryVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  vehicles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    }
  ],
  medicalNotes: {
    type: String,
    default: ''
  },
  emergencyContacts: {
    type: [EmergencyContactSchema],
    validate: [
      (val) => val.length <= 6,
      'Maximum 6 emergency contacts can be registered'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
