const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  dateString: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'HALF_DAY', 'LEAVE', 'WEEKLY_OFF', 'HOLIDAY'],
    default: 'PRESENT'
  },
  checkIn: {
    type: Date,
    default: null
  },
  checkOut: {
    type: Date,
    default: null
  },
  hoursWorked: {
    type: Number,
    default: 8
  },
  workSummary: {
    type: String,
    default: ''
  },
  leaveReason: {
    type: String,
    default: ''
  },
  leaveType: {
    type: String,
    enum: ['CASUAL', 'SICK', 'WEEKLY_OFF', 'FESTIVAL', 'EMERGENCY', 'UNPAID', 'NONE'],
    default: 'NONE'
  },
  stickersSold: {
    type: Number,
    default: 0
  },
  customersOnboarded: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Ensure unique attendance entry per user per day
AttendanceSchema.index({ user: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
