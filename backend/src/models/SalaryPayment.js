const mongoose = require('mongoose');

const SalaryPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Staff user reference is required'],
    index: true
  },
  month: {
    type: Number, // 0 for Jan, 9 for Oct, 11 for Dec
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  monthLabel: {
    type: String, // e.g. "October 2026"
    default: ''
  },
  baseSalary: {
    type: Number,
    default: 15000
  },
  scannersSold: {
    type: Number,
    default: 0
  },
  incentiveRate: {
    type: Number,
    default: 100
  },
  incentiveAmount: {
    type: Number,
    default: 0
  },
  totalPayable: {
    type: Number,
    default: 15000
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING', 'CANCELLED'],
    default: 'PAID'
  },
  paymentMode: {
    type: String,
    enum: ['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'OTHER'],
    default: 'UPI'
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  paidAt: {
    type: Date,
    default: Date.now
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

SalaryPaymentSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('SalaryPayment', SalaryPaymentSchema);
