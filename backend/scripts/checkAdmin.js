const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore fallback
}

const User = require('../src/models/User');

async function main() {
  const atlasFallback = 'mongodb+srv://kiranrathod632_db_user:lKtisnFylyZbc1hs@cluster0.dvpntjn.mongodb.net/gadiraksha_db?retryWrites=true&w=majority';
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || atlasFallback;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: true
  });
  const users = await User.find({}, 'name phone role email');
  console.log('--- ALL USERS IN DB ---');
  users.forEach(u => console.log(`${u.role} | ${u.phone} | ${u.name}`));

  let admin = await User.findOne({ phone: '9823000000' });
  if (!admin) {
    admin = await User.findOne({ role: 'admin' });
  }

  if (admin) {
    admin.phone = '9823000000';
    admin.password = 'password123';
    admin.role = 'admin';
    await admin.save();
    console.log('SUCCESS: Admin set to phone: 9823000000, password: password123, role: admin');
  } else {
    admin = new User({
      name: 'Super Admin Sambhaji Patil',
      phone: '9823000000',
      password: 'password123',
      role: 'admin',
      email: 'admin@gadiraksha.in'
    });
    await admin.save();
    console.log('SUCCESS: Created new Admin 9823000000 with password123');
  }

  // Also verify sales staff
  let sales = await User.findOne({ phone: '9821889900' });
  if (sales) {
    sales.password = 'password123';
    await sales.save();
    console.log('SUCCESS: Sales user 9821889900 password set to password123');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
