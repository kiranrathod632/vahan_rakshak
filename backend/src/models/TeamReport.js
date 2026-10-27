const mongoose = require('mongoose');

const TeamReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  memberPhone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['sales', 'marketing', 'support', 'admin'],
    required: true
  },
  department: {
    type: String,
    default: 'Field Operations'
  },
  period: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    default: 'DAILY'
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  tasksSummary: {
    type: String,
    required: true
  },
  stickersAssignedOrSold: {
    type: Number,
    default: 0
  },
  usersOnboarded: {
    type: Number,
    default: 0
  },
  revenueGenerated: {
    type: Number,
    default: 0
  },
  hoursWorked: {
    type: Number,
    default: 8
  },
  leadsContacted: {
    type: Number,
    default: 0
  },
  notesAndFeedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'APPROVED', 'REVIEWED'],
    default: 'SUBMITTED'
  }
}, { timestamps: true });

module.exports = mongoose.model('TeamReport', TeamReportSchema);
