const mongoose = require('mongoose');

const DocumentSubSchema = new mongoose.Schema({
  docNumber: { type: String, default: '' },
  companyName: { type: String, default: '' }, // e.g. For Insurance (Bajaj, ICICI Lombard, etc.)
  validFrom: { type: Date, default: null },
  validUntil: { type: Date, default: null },
  documentUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false }
}, { _id: false });

const TagSchema = new mongoose.Schema({
  tagCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  qrUrl: {
    type: String,
    required: true
  },
  qrImageBase64: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['UNCLAIMED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'UNCLAIMED',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null,
    index: true
  },
  vehicleDetails: {
    vehicleNumber: {
      type: String,
      uppercase: true,
      trim: true,
      default: ''
    },
    vehicleType: {
      type: String,
      enum: ['Two-Wheeler', 'Four-Wheeler', 'Auto-Rickshaw', 'Commercial/Truck', 'EV', 'Other', ''],
      default: ''
    },
    vehicleModel: {
      type: String,
      default: ''
    },
    vehicleColor: {
      type: String,
      default: ''
    }
  },
  // Scanner Purchase & Subscription Status
  purchaseInfo: {
    isPaid: {
      type: Boolean,
      default: true
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'EXPIRED', 'FREE_TRIAL', 'LIFETIME'],
      default: 'PAID'
    },
    plan: {
      type: String,
      enum: ['1_YEAR_STANDARD', '3_YEAR_PRO', 'LIFETIME', 'CUSTOM'],
      default: '1_YEAR_STANDARD'
    },
    amountPaid: {
      type: Number,
      default: 299 // Default INR cost of smart sticker
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year from now
    },
    transactionId: {
      type: String,
      default: ''
    }
  },
  // Digital Vehicle Documents (PUC, Insurance, RC, Fitness)
  documents: {
    puc: {
      type: DocumentSubSchema,
      default: () => ({})
    },
    insurance: {
      type: DocumentSubSchema,
      default: () => ({})
    },
    rc: {
      type: DocumentSubSchema,
      default: () => ({})
    },
    fitness: {
      type: DocumentSubSchema,
      default: () => ({})
    }
  },
  privacySettings: {
    maskVehicleNumber: {
      type: Boolean,
      default: false
    },
    allowDirectCall: {
      type: Boolean,
      default: false
    },
    // If true, traffic police / checking officers can see PUC & Insurance validity on scan
    showDocsOnScan: {
      type: Boolean,
      default: true
    }
  },
  claimedAt: {
    type: Date,
    default: null
  },
  totalScans: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Virtual to check if subscription is currently active
TagSchema.virtual('isSubscriptionActive').get(function () {
  if (this.purchaseInfo.paymentStatus === 'LIFETIME') return true;
  if (!this.purchaseInfo.isPaid || this.purchaseInfo.paymentStatus === 'EXPIRED') return false;
  if (!this.purchaseInfo.validUntil) return true;
  return new Date() <= new Date(this.purchaseInfo.validUntil);
});

module.exports = mongoose.model('Tag', TagSchema);
