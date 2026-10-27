const mongoose = require('mongoose');
const QRCode = require('qrcode');
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
const Vehicle = require('../src/models/Vehicle');
const Tag = require('../src/models/Tag');
const Attendance = require('../src/models/Attendance');

const toDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function seed() {
  const atlasFallback = 'mongodb+srv://kiranrathod632_db_user:lKtisnFylyZbc1hs@cluster0.dvpntjn.mongodb.net/gadiraksha_db?retryWrites=true&w=majority';
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || atlasFallback;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    family: 4,
    tls: true,
    tlsAllowInvalidCertificates: true
  });
  console.log('Connected to MongoDB Atlas for Sales Seeding...');

  // 1. Find or create Sachin Gaikwad (Sales Person)
  let salesAgent = await User.findOne({ phone: '9821889900' });
  if (!salesAgent) {
    salesAgent = new User({
      name: 'Sachin Gaikwad',
      phone: '9821889900',
      password: 'password123',
      role: 'sales',
      department: 'Field Operations & Dealerships',
      monthlyTarget: 60,
      salaryOrCommissionRate: 125,
      dateOfJoining: new Date(2026, 0, 15),
      bankDetails: {
        accountHolderName: 'Sachin Ashok Gaikwad',
        bankName: 'HDFC Bank',
        accountNumber: '50100492810341',
        ifscCode: 'HDFC0000123',
        upiId: 'sachin.gaikwad@okhdfcbank'
      }
    });
    await salesAgent.save();
  } else {
    salesAgent.role = 'sales';
    salesAgent.monthlyTarget = 60;
    salesAgent.salaryOrCommissionRate = 125;
    salesAgent.baseSalary = 18000;
    salesAgent.incentivePerScanner = 125;
    salesAgent.bankDetails = {
      accountHolderName: 'Sachin Ashok Gaikwad',
      bankName: 'HDFC Bank',
      accountNumber: '50100492810341',
      ifscCode: 'HDFC0000123',
      upiId: 'sachin.gaikwad@okhdfcbank'
    };
    await salesAgent.save();
  }

  console.log(`Sales Agent Ready: ${salesAgent.name} (${salesAgent.phone}), ID: ${salesAgent._id}`);

  // Delete previous test customers created by this script if any
  await User.deleteMany({ createdBy: salesAgent._id });
  await Attendance.deleteMany({ user: salesAgent._id });
  await Tag.deleteMany({ assignedBy: salesAgent._id });
  await Tag.deleteMany({ tagCode: { $regex: /^MH-10/ } });

  const now = new Date();
  const clientBaseUrl = process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:5000';

  const demoCustomers = [
    // Today's Onboarded Customers (3 Users Active Today)
    {
      name: 'Rahul Sharad Shinde',
      phone: '9890123401',
      plate: 'MH 12 RN 8821',
      model: 'Hyundai Creta SX',
      type: 'Car',
      color: 'Titan Grey',
      tagCode: 'MH-1001',
      bloodGroup: 'O+',
      offsetDays: 0,
      offsetHours: -2,
      emergency: { name: 'Pooja Shinde', phone: '9890123499', relation: 'Spouse' }
    },
    {
      name: 'Amit Vijay Deshmukh',
      phone: '9890123402',
      plate: 'MH 14 EQ 4402',
      model: 'Honda Activa 6G',
      type: 'Two-Wheeler',
      color: 'Matte Blue',
      tagCode: 'MH-1002',
      bloodGroup: 'B+',
      offsetDays: 0,
      offsetHours: -4,
      emergency: { name: 'Vijay Deshmukh', phone: '9890123498', relation: 'Father' }
    },
    {
      name: 'Priyanka Sunilkumar More',
      phone: '9890123403',
      plate: 'MH 12 TX 1109',
      model: 'Tata Nexon EV',
      type: 'Car',
      color: 'Teal Blue',
      tagCode: 'MH-1003',
      bloodGroup: 'AB+',
      offsetDays: 0,
      offsetHours: -5,
      emergency: { name: 'Sunil More', phone: '9890123497', relation: 'Father' }
    },

    // This Week's Earlier Customers (3 Users)
    {
      name: 'Ganesh Pandurang Kadam',
      phone: '9890123404',
      plate: 'MH 12 AB 9912',
      model: 'Royal Enfield Classic 350',
      type: 'Two-Wheeler',
      color: 'Stealth Black',
      tagCode: 'MH-1004',
      bloodGroup: 'A+',
      offsetDays: 2,
      offsetHours: 0,
      emergency: { name: 'Sunita Kadam', phone: '9890123496', relation: 'Spouse' }
    },
    {
      name: 'Sunil Baban Jagtap',
      phone: '9890123405',
      plate: 'MH 14 DF 5543',
      model: 'Maruti Suzuki Swift',
      type: 'Car',
      color: 'Pearl White',
      tagCode: 'MH-1005',
      bloodGroup: 'O+',
      offsetDays: 3,
      offsetHours: 0,
      emergency: { name: 'Rohan Jagtap', phone: '9890123495', relation: 'Brother' }
    },
    {
      name: 'Vikas Ramchandra Pawar',
      phone: '9890123406',
      plate: 'MH 12 KP 3320',
      model: 'Mahindra Scorpio-N',
      type: 'Car',
      color: 'Napoli Black',
      tagCode: 'MH-1006',
      bloodGroup: 'B+',
      offsetDays: 4,
      offsetHours: 0,
      emergency: { name: 'Anjali Pawar', phone: '9890123494', relation: 'Spouse' }
    },

    // Earlier This Month (October 2026 - 6 Users)
    {
      name: 'Deepak Mohan Salunkhe',
      phone: '9890123407',
      plate: 'MH 12 ZZ 1200',
      model: 'TVS Jupiter 125',
      type: 'Two-Wheeler',
      color: 'Dawn Orange',
      tagCode: 'MH-1007',
      bloodGroup: 'O-',
      offsetDays: 9,
      offsetHours: 0,
      emergency: { name: 'Mohan Salunkhe', phone: '9890123493', relation: 'Father' }
    },
    {
      name: 'Sandip Dnyaneshwar Gholap',
      phone: '9890123408',
      plate: 'MH 14 GH 7821',
      model: 'Toyota Innova Crysta',
      type: 'Car',
      color: 'Silver Metallic',
      tagCode: 'MH-1008',
      bloodGroup: 'A+',
      offsetDays: 12,
      offsetHours: 0,
      emergency: { name: 'Kavita Gholap', phone: '9890123492', relation: 'Spouse' }
    },
    {
      name: 'Manoj Vitthal Thorat',
      phone: '9890123409',
      plate: 'MH 12 RT 6701',
      model: 'Bajaj Pulsar NS200',
      type: 'Two-Wheeler',
      color: 'Burnt Red',
      tagCode: 'MH-1009',
      bloodGroup: 'B+',
      offsetDays: 15,
      offsetHours: 0,
      emergency: { name: 'Vitthal Thorat', phone: '9890123491', relation: 'Father' }
    },
    {
      name: 'Mahesh Anna Khade',
      phone: '9890123410',
      plate: 'MH 14 BY 9901',
      model: 'Kia Seltos Facelift',
      type: 'Car',
      color: 'Glacier White Pearl',
      tagCode: 'MH-1010',
      bloodGroup: 'O+',
      offsetDays: 18,
      offsetHours: 0,
      emergency: { name: 'Surekha Khade', phone: '9890123490', relation: 'Spouse' }
    },
    {
      name: 'Nitin Dattatray Shirole',
      phone: '9890123411',
      plate: 'MH 12 MK 4519',
      model: 'Tata Punch Adventure',
      type: 'Car',
      color: 'Calypso Red',
      tagCode: 'MH-1011',
      bloodGroup: 'AB+',
      offsetDays: 21,
      offsetHours: 0,
      emergency: { name: 'Prashant Shirole', phone: '9890123489', relation: 'Brother' }
    },
    {
      name: 'Sagar Chandrakant Jagdale',
      phone: '9890123412',
      plate: 'MH 14 PQ 8181',
      model: 'Yamaha FZ-S V4',
      type: 'Two-Wheeler',
      color: 'Racing Blue',
      tagCode: 'MH-1012',
      bloodGroup: 'B-',
      offsetDays: 23,
      offsetHours: 0,
      emergency: { name: 'Chandrakant Jagdale', phone: '9890123488', relation: 'Father' }
    },

    // Earlier Months in 2026 (September, August - for Yearly trend)
    {
      name: 'Dinesh Balasaheb Gite',
      phone: '9890123413',
      plate: 'MH 12 LK 9900',
      model: 'Skoda Kushaq',
      type: 'Car',
      color: 'Honey Orange',
      tagCode: 'MH-1013',
      bloodGroup: 'A+',
      offsetDays: 45,
      offsetHours: 0,
      emergency: { name: 'Sarita Gite', phone: '9890123487', relation: 'Spouse' }
    },
    {
      name: 'Pradip Kisan Bhise',
      phone: '9890123414',
      plate: 'MH 14 VB 2341',
      model: 'Suzuki Access 125',
      type: 'Two-Wheeler',
      color: 'Solid Ice Green',
      tagCode: 'MH-1014',
      bloodGroup: 'O+',
      offsetDays: 52,
      offsetHours: 0,
      emergency: { name: 'Kisan Bhise', phone: '9890123486', relation: 'Father' }
    },
    {
      name: 'Ajay Suresh Nalawade',
      phone: '9890123415',
      plate: 'MH 12 QW 6112',
      model: 'Volkswagen Taigun',
      type: 'Car',
      color: 'Curcuma Yellow',
      tagCode: 'MH-1015',
      bloodGroup: 'B+',
      offsetDays: 70,
      offsetHours: 0,
      emergency: { name: 'Rohini Nalawade', phone: '9890123485', relation: 'Spouse' }
    }
  ];

  console.log(`Seeding ${demoCustomers.length} onboarded customers for Sachin Gaikwad...`);

  for (const c of demoCustomers) {
    const createdDate = new Date(now);
    createdDate.setDate(now.getDate() - c.offsetDays);
    if (c.offsetHours) {
      createdDate.setHours(now.getHours() + c.offsetHours);
    }

    // 1. User
    const user = await User.create({
      name: c.name,
      phone: c.phone,
      email: `${c.name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      password: 'password123',
      role: 'user',
      bloodGroup: c.bloodGroup,
      medicalNotes: 'No major medical issues. Regular driver.',
      address: {
        fullAddress: 'Flat 402, Shivshankar Residency, Katraj-Kondhwa Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411048'
      },
      createdBy: salesAgent._id,
      soldBy: salesAgent._id,
      emergencyContacts: [
        {
          name: c.emergency.name,
          phone: c.emergency.phone,
          relation: c.emergency.relation,
          isPrimary: true
        }
      ],
      createdAt: createdDate,
      updatedAt: createdDate,
      status: 'ACTIVE'
    });

    // 2. Vehicle
    const vehicle = await Vehicle.create({
      vehicleNumber: c.plate,
      vehicleType: c.type,
      vehicleModel: c.model,
      vehicleColor: c.color,
      user: user._id,
      isPrimary: true,
      createdAt: createdDate
    });

    user.primaryVehicle = vehicle._id;
    user.vehicles = [vehicle._id];
    await user.save();

    // 3. Tag
    const scanUrl = `${clientBaseUrl}/scan/${c.tagCode}`;
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const tag = await Tag.create({
      tagCode: c.tagCode,
      qrUrl: scanUrl,
      qrImageBase64: qrDataUrl,
      user: user._id,
      vehicle: vehicle._id,
      status: 'ACTIVE',
      totalScans: Math.floor(Math.random() * 8) + 1,
      claimedAt: createdDate,
      assignedBy: salesAgent._id,
      createdAt: createdDate
    });

    vehicle.tag = tag._id;
    await vehicle.save();
  }

  // 2. Seed Attendance Records for October 2026 (Working Days vs Chutti / Leaves)
  console.log('Seeding Attendance & Working Days vs Chutti (Leaves) for Sachin Gaikwad...');

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // October = 9 in 0-indexed
  const todayDay = now.getDate();

  for (let day = 1; day <= todayDay; day++) {
    const d = new Date(currentYear, currentMonth, day);
    const dayOfWeek = d.getDay(); // 0 = Sunday
    const dateStr = toDateString(d);

    let status = 'PRESENT';
    let hoursWorked = 8;
    let workSummary = 'Field dealership visits in Swargate, Camp & Pune RTO. QR stand placements and owner on-spot onboarding.';
    let leaveReason = '';
    let leaveType = 'NONE';
    let checkIn = new Date(d);
    checkIn.setHours(9, 30, 0);
    let checkOut = new Date(d);
    checkOut.setHours(18, 30, 0);

    // Sundays are Weekly Off (Chutti)
    if (dayOfWeek === 0) {
      status = 'WEEKLY_OFF';
      hoursWorked = 0;
      workSummary = 'Scheduled Sunday Weekly Off';
      leaveReason = 'Weekly Holiday (रविवार साप्ताहिक अवकाश)';
      leaveType = 'WEEKLY_OFF';
      checkIn = null;
      checkOut = null;
    } else if (day === 8) {
      // 1 Sick Leave (Chutti)
      status = 'LEAVE';
      hoursWorked = 0;
      workSummary = '';
      leaveReason = 'Viral fever & medical checkup (तबीयत खराब होने के कारण अवकाश)';
      leaveType = 'SICK';
      checkIn = null;
      checkOut = null;
    } else if (day === 17) {
      // 1 Casual / Festival Leave (Chutti)
      status = 'LEAVE';
      hoursWorked = 0;
      workSummary = '';
      leaveReason = 'Family festival celebration leave (पारिवारिक उत्सव अवकाश)';
      leaveType = 'FESTIVAL';
      checkIn = null;
      checkOut = null;
    } else if (day === 14) {
      // 1 Half Day
      status = 'HALF_DAY';
      hoursWorked = 4;
      workSummary = 'Morning dealership visits at Hadapsar auto cluster. Afternoon off.';
      leaveReason = 'Personal afternoon work (हाफ डे)';
      leaveType = 'CASUAL';
      checkOut = new Date(d);
      checkOut.setHours(14, 0, 0);
    } else if (day === todayDay) {
      // Today is Present & Duty Active!
      status = 'PRESENT';
      hoursWorked = 7;
      workSummary = 'Today active on field: onboarded 3 new vehicles, placed 6 showroom displays in Katraj.';
      checkIn = new Date();
      checkIn.setHours(9, 15, 0);
      checkOut = null; // Still on duty!
    }

    await Attendance.create({
      user: salesAgent._id,
      date: d,
      dateString: dateStr,
      status,
      checkIn,
      checkOut,
      hoursWorked,
      workSummary,
      leaveReason,
      leaveType,
      stickersSold: status === 'PRESENT' ? 2 : 0,
      customersOnboarded: status === 'PRESENT' ? 1 : 0
    });
  }

  // Update Sales Agent's totals in DB
  const totalOnboarded = await User.countDocuments({ createdBy: salesAgent._id });
  salesAgent.totalSalesCount = totalOnboarded;
  salesAgent.totalCommissionEarned = totalOnboarded * salesAgent.salaryOrCommissionRate;
  await salesAgent.save();

  console.log(`✅ Seeding Complete! Sachin Gaikwad has ${totalOnboarded} customers and full attendance history.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
