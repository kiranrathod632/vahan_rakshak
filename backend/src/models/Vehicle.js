const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID (owner) is required'],
    index: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number (plate) is required'],
    uppercase: true,
    trim: true,
    index: true
  },
  vehicleType: {
    type: String,
    enum: ['Two-Wheeler', 'Four-Wheeler', 'Car', 'Bike', 'Auto-Rickshaw', 'Commercial/Truck', 'Commercial', 'EV', 'Other'],
    default: 'Two-Wheeler'
  },
  vehicleModel: {
    type: String,
    default: '',
    trim: true
  },
  vehicleColor: {
    type: String,
    default: '',
    trim: true
  },
  // Linked QR Scanner / Tag Code
  tagCode: {
    type: String,
    uppercase: true,
    trim: true,
    default: '',
    index: true
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    default: null
  },
  // Digital Vehicle Documents
  puc: {
    pucNumber: { type: String, default: '' },
    validUntil: { type: Date, default: null },
    documentUrl: { type: String, default: '' }
  },
  insurance: {
    insuranceNumber: { type: String, default: '' },
    insuranceCompany: { type: String, default: '' },
    validUntil: { type: Date, default: null },
    documentUrl: { type: String, default: '' }
  },
  rc: {
    rcNumber: { type: String, default: '' },
    documentUrl: { type: String, default: '' }
  },
  isPrimary: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
