const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    enum: ['user', 'sales', 'marketing', 'support', 'admin', 'superadmin']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    type: String
  }],
  level: {
    type: Number,
    default: 1 // 1: user, 2: sales/support, 3: admin, 4: superadmin
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-seed standard roles if not present
RoleSchema.statics.seedDefaultRoles = async function() {
  const defaultRoles = [
    {
      name: 'user',
      displayName: 'Vehicle Owner',
      description: 'Standard vehicle owner. Can manage vehicles, scanner, emergency contacts, and profile.',
      permissions: ['read:own_profile', 'update:own_profile', 'read:own_vehicles', 'manage:own_scanners'],
      level: 1
    },
    {
      name: 'sales',
      displayName: 'Sales Executive',
      description: 'Field sales agent. Can onboard customers, assign stickers, track personal sales and commissions.',
      permissions: ['create:customer_user', 'assign:qr_scanner', 'read:my_sales', 'read:my_customers', 'submit:work_report'],
      level: 2
    },
    {
      name: 'marketing',
      displayName: 'Marketing Specialist',
      description: 'Marketing staff. Manages campaigns, lead acquisition, and customer outreach.',
      permissions: ['read:campaigns', 'read:leads', 'submit:work_report'],
      level: 2
    },
    {
      name: 'support',
      displayName: 'Customer Support',
      description: 'Customer care executive. Handles SOS tests, KYC, and resolves vehicle owner issues.',
      permissions: ['read:emergency_logs', 'resolve:emergencies', 'read:users', 'submit:work_report'],
      level: 2
    },
    {
      name: 'admin',
      displayName: 'Operations Administrator',
      description: 'Admin. Full access to User Dashboard (users, fleet, stock) and Team Dashboard (productivity, reports).',
      permissions: ['manage:users', 'manage:vehicles', 'manage:scanners', 'manage:team', 'read:all_reports'],
      level: 3
    },
    {
      name: 'superadmin',
      displayName: 'Super Administrator',
      description: 'Master Admin. Complete unrestricted platform control, revenue oversight, admin creation, and system configuration.',
      permissions: ['*'],
      level: 4
    }
  ];

  for (const r of defaultRoles) {
    await this.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
  }
};

module.exports = mongoose.model('Role', RoleSchema);
