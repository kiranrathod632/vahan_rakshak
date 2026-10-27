const mongoose = require('mongoose');

const AlertLogSchema = new mongoose.Schema({
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
    index: true
  },
  tagCode: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  alertType: {
    type: String,
    enum: [
      'NO_PARKING',
      'ACCIDENT',
      'BLOCKED_WAY',
      'LIGHTS_ON',
      'WINDOW_OPEN',
      'TOW_WARNING',
      'GENERAL_ALERT'
    ],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['SENT', 'DELIVERED', 'RESOLVED', 'DISMISSED'],
    default: 'SENT'
  },
  scannerDetails: {
    name: { type: String, default: 'Concerned Citizen' },
    phone: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null }
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: '' },
    googleMapsUrl: { type: String, default: '' }
  },
  scannerNote: {
    type: String,
    default: ''
  },
  notificationsSent: [
    {
      recipientType: { type: String, enum: ['OWNER', 'FAMILY_CONTACT'] },
      recipientName: String,
      phone: String,
      channel: { type: String, enum: ['WHATSAPP', 'SMS', 'CALL', 'SOCKET'] },
      deliveryStatus: { type: String, default: 'SENT' },
      sentAt: { type: Date, default: Date.now },
      error: { type: String, default: null }
    }
  ],
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('AlertLog', AlertLogSchema);
