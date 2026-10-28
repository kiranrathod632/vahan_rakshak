const QRCode = require('qrcode');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Tag = require('../models/Tag');
const TeamReport = require('../models/TeamReport');
const Attendance = require('../models/Attendance');
const { getClientBaseUrl } = require('../utils/urlHelper');

/**
 * Helper to normalize date to YYYY-MM-DD string
 */
const toDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * @desc    Get logged-in Sales Person's Personal Metrics, Today's Active Users & Breakdown
 * @route   GET /api/sales/my-stats
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const getMySalesStats = async (req, res, next) => {
  try {
    const salesPersonId = req.user?._id;

    // Filter customers brought in by this salesperson
    const filter = salesPersonId
      ? { $or: [{ soldBy: salesPersonId }, { createdBy: salesPersonId }], role: 'user' }
      : { role: 'user' };

    const totalCustomers = await User.countDocuments(filter);

    const now = new Date();

    // 1. TODAY'S START (Aaj kitne active kiye)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayCount = await User.countDocuments({ ...filter, createdAt: { $gte: todayStart } });

    // 2. THIS WEEK'S START
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = await User.countDocuments({ ...filter, createdAt: { $gte: weekStart } });

    // 3. THIS MONTH'S START
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const monthCount = await User.countDocuments({ ...filter, createdAt: { $gte: monthStart } });

    // 4. THIS YEAR'S START (Yearly Sales)
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    const yearCount = await User.countDocuments({ ...filter, createdAt: { $gte: yearStart } });

    // Dynamic targets & commission rate
    const monthlyTarget = req.user?.monthlyTarget || 50;
    const yearlyTarget = monthlyTarget * 12;
    const targetAchievedPercent = Math.min(100, Math.round((monthCount / monthlyTarget) * 100));
    const COMMISSION_RATE = req.user?.salaryOrCommissionRate || 100;
    const totalCommission = (totalCustomers * COMMISSION_RATE) + (req.user?.totalCommissionEarned || 0);

    // Tags / Scanners sold by this agent
    const tagFilter = salesPersonId ? { assignedBy: salesPersonId } : {};
    let totalTagsSold = await Tag.countDocuments(tagFilter);
    if (totalTagsSold === 0 && totalCustomers > 0) {
      totalTagsSold = totalCustomers;
    }

    const todayTagsSold = await Tag.countDocuments({ ...tagFilter, claimedAt: { $gte: todayStart } }) || todayCount;

    // Attendance summary for current month
    const todayStr = toDateString(now);
    const todayAttendance = await Attendance.findOne({ user: req.user._id, dateString: todayStr });

    const monthAttendanceRecords = await Attendance.find({
      user: req.user._id,
      date: { $gte: monthStart }
    });

    const daysWorked = monthAttendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
    const leavesTaken = monthAttendanceRecords.filter(r => r.status === 'LEAVE').length;
    const weeklyOffs = monthAttendanceRecords.filter(r => r.status === 'WEEKLY_OFF').length;
    const halfDays = monthAttendanceRecords.filter(r => r.status === 'HALF_DAY').length;

    // Base salary & incentive per scanner
    const baseSalary = req.user?.baseSalary !== undefined && req.user?.baseSalary !== null ? req.user.baseSalary : 15000;
    const incentivePerScanner = req.user?.incentivePerScanner || req.user?.salaryOrCommissionRate || 100;
    const monthIncentiveEarned = monthCount * incentivePerScanner;
    const totalSalaryPayable = baseSalary + monthIncentiveEarned;

    // Vehicle category breakdown for pie / distribution chart
    const customerUserIds = (await User.find(filter).select('_id')).map(u => u._id);
    const customerVehicles = await Vehicle.find({ user: { $in: customerUserIds } });
    const vehicleDistribution = {
      cars: 0,
      twoWheelers: 0,
      commercial: 0,
      other: 0
    };
    customerVehicles.forEach(v => {
      const t = (v.vehicleType || 'Car').toLowerCase();
      if (t.includes('car') || t.includes('suv') || t.includes('sedan') || t.includes('hatchback')) {
        vehicleDistribution.cars += 1;
      } else if (t.includes('bike') || t.includes('scooter') || t.includes('two') || t.includes('motorcycle')) {
        vehicleDistribution.twoWheelers += 1;
      } else if (t.includes('truck') || t.includes('bus') || t.includes('commercial') || t.includes('van')) {
        vehicleDistribution.commercial += 1;
      } else {
        vehicleDistribution.other += 1;
      }
    });

    res.json({
      success: true,
      data: {
        agent: {
          _id: req.user?._id,
          name: req.user?.name || 'Sales Officer',
          phone: req.user?.phone,
          department: req.user?.department || 'Field Sales',
          monthlyTarget,
          yearlyTarget,
          baseSalary,
          incentivePerScanner,
          bankDetails: req.user?.bankDetails || {}
        },
        metrics: {
          totalCustomers,
          totalTagsSold,
          todaySales: todayCount, // Aaj kitne active kiye
          todayTagsSold,
          weekSales: weekCount,
          monthSales: monthCount,
          yearSales: yearCount,
          targetAchievedPercent,
          totalCommissionEarned: totalCommission,
          commissionPerUnit: incentivePerScanner,
          baseSalary,
          incentivePerScanner,
          monthIncentiveEarned,
          totalSalaryPayable
        },
        payroll: {
          baseSalary,
          incentivePerScanner,
          scannersSoldMonth: monthCount,
          monthIncentiveEarned,
          totalSalaryPayable,
          bankDetails: req.user?.bankDetails || {}
        },
        attendanceSummary: {
          todayStatus: todayAttendance ? todayAttendance.status : 'NOT_MARKED',
          todayRecord: todayAttendance,
          daysWorkedMonth: daysWorked,
          leavesTakenMonth: leavesTaken,
          weeklyOffsMonth: weeklyOffs,
          halfDaysMonth: halfDays
        },
        chartData: {
          vehicleDistribution,
          attendanceDistribution: {
            present: daysWorked,
            leaves: leavesTaken,
            weeklyOffs: weeklyOffs,
            halfDays: halfDays
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get List of Customers / Users Onboarded by this Sales Person
 * @route   GET /api/sales/my-users
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const getMyAddedUsers = async (req, res, next) => {
  try {
    const salesPersonId = req.user?._id;
    const { search, page = 1, limit = 50 } = req.query;

    const filter = salesPersonId
      ? { $or: [{ soldBy: salesPersonId }, { createdBy: salesPersonId }], role: 'user' }
      : { role: 'user' };

    if (search) {
      filter.$and = [
        {
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { phone: { $regex: search.trim(), $options: 'i' } }
          ]
        }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .populate('primaryVehicle')
      .populate('vehicles')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Also fetch associated tag codes
    const userIds = users.map(u => u._id);
    const tags = await Tag.find({ user: { $in: userIds } });
    const tagMap = {};
    tags.forEach(t => {
      tagMap[t.user?.toString()] = t;
    });

    const enrichedUsers = users.map(u => {
      const tag = tagMap[u._id.toString()];
      return {
        _id: u._id,
        name: u.name || 'Vehicle Owner',
        phone: u.phone,
        email: u.email || 'N/A',
        bloodGroup: u.bloodGroup || 'B+',
        medicalNotes: u.medicalNotes || '',
        address: u.address || {},
        vehicleNumber: u.primaryVehicle?.vehicleNumber || (u.vehicles?.[0]?.vehicleNumber) || 'N/A',
        vehicleModel: u.primaryVehicle?.vehicleModel || (u.vehicles?.[0]?.vehicleModel) || 'Standard',
        vehicleType: u.primaryVehicle?.vehicleType || (u.vehicles?.[0]?.vehicleType) || 'Car',
        vehicleColor: u.primaryVehicle?.vehicleColor || (u.vehicles?.[0]?.vehicleColor) || 'White',
        tagCode: tag?.tagCode || 'TAG-' + u.phone.slice(-4),
        tagStatus: tag?.status || 'ACTIVE',
        totalScans: tag?.totalScans || 0,
        emergencyContacts: u.emergencyContacts || [],
        emergencyContactsCount: u.emergencyContacts?.length || 0,
        onboardedAt: u.createdAt,
        status: u.status || 'ACTIVE'
      };
    });

    res.json({
      success: true,
      total,
      count: enrichedUsers.length,
      data: enrichedUsers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Customer Full Details Dossier (For Eye button)
 * @route   GET /api/sales/customer/:id
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const getCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password')
      .populate('primaryVehicle')
      .populate('vehicles');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer record not found' });
    }

    const tag = await Tag.findOne({ user: user._id });

    const dossier = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email || 'Not provided',
      gender: user.gender,
      bloodGroup: user.bloodGroup || 'B+',
      weight: user.weight,
      height: user.height,
      medicalNotes: user.medicalNotes || 'No critical allergies reported',
      address: user.address || {},
      status: user.status,
      onboardedAt: user.createdAt,
      primaryVehicle: user.primaryVehicle || user.vehicles?.[0] || {
        vehicleNumber: 'N/A',
        vehicleModel: 'Standard',
        vehicleType: 'Car',
        vehicleColor: 'White'
      },
      vehicles: user.vehicles || [],
      tag: tag || {
        tagCode: 'TAG-' + user.phone.slice(-4),
        status: 'ACTIVE',
        totalScans: 0,
        claimedAt: user.createdAt
      },
      emergencyContacts: user.emergencyContacts || []
    };

    res.json({
      success: true,
      data: dossier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Customer and Vehicle Details by Sales Agent
 * @route   PUT /api/sales/customer/:id
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      bloodGroup,
      medicalNotes,
      fullAddress,
      city,
      state,
      pincode,
      vehicleNumber,
      vehicleModel,
      vehicleType,
      vehicleColor
    } = req.body;

    const user = await User.findById(id).populate('primaryVehicle');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer record not found' });
    }

    // Permission check: Sales agent can only edit customers they onboarded, unless Admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      const isOwner = (user.soldBy && user.soldBy.toString() === req.user._id.toString()) ||
                      (user.createdBy && user.createdBy.toString() === req.user._id.toString());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only edit customers onboarded by you' });
      }
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim().replace(/\s+/g, '');
    if (email !== undefined) user.email = email ? email.trim() : null;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (medicalNotes !== undefined) user.medicalNotes = medicalNotes;
    if (req.body.status) {
      user.status = req.body.status;
      user.isActive = req.body.status === 'ACTIVE';
    } else if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
      user.status = req.body.isActive ? 'ACTIVE' : 'BLOCKED';
    }
    
    if (fullAddress !== undefined || city !== undefined || state !== undefined || pincode !== undefined) {
      user.address = {
        fullAddress: fullAddress !== undefined ? fullAddress : (user.address?.fullAddress || ''),
        city: city !== undefined ? city : (user.address?.city || 'Pune'),
        state: state !== undefined ? state : (user.address?.state || 'Maharashtra'),
        pincode: pincode !== undefined ? pincode : (user.address?.pincode || '')
      };
    }

    await user.save();

    // Update primary vehicle if provided
    if (user.primaryVehicle && (vehicleNumber || vehicleModel || vehicleType || vehicleColor)) {
      const v = await Vehicle.findById(user.primaryVehicle._id || user.primaryVehicle);
      if (v) {
        if (vehicleNumber) v.vehicleNumber = vehicleNumber.trim().toUpperCase();
        if (vehicleModel) v.vehicleModel = vehicleModel.trim();
        if (vehicleType) v.vehicleType = vehicleType;
        if (vehicleColor) v.vehicleColor = vehicleColor;
        await v.save();
      }
    }

    res.json({
      success: true,
      message: 'Customer details updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Customer and Unlink Tag by Sales Agent
 * @route   DELETE /api/sales/customer/:id
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer record not found' });
    }

    // Permission check: Sales agent can only delete customers they onboarded, unless Admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      const isOwner = (user.soldBy && user.soldBy.toString() === req.user._id.toString()) ||
                      (user.createdBy && user.createdBy.toString() === req.user._id.toString());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only delete customers onboarded by you' });
      }
    }

    // Release and unbind associated tags so the physical sticker can be reused
    await Tag.updateMany(
      { user: user._id },
      { $set: { status: 'UNCLAIMED', user: null, vehicle: null, assignedBy: null } }
    );

    // Delete vehicles belonging to user
    await Vehicle.deleteMany({ user: user._id });

    // Decrement salesman sales stats if applicable
    if (user.soldBy) {
      const commissionRate = req.user?.salaryOrCommissionRate || 100;
      await User.findByIdAndUpdate(user.soldBy, {
        $inc: { totalSalesCount: -1, totalCommissionEarned: -commissionRate }
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Customer ${user.name} removed successfully and QR sticker has been unlinked`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Direct Customer Onboarding by Sales Agent
 * @route   POST /api/sales/onboard-user
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const onboardCustomer = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      password = 'password123',
      vehicleNumber,
      vehicleType = 'Car',
      vehicleModel = 'Standard',
      vehicleColor = 'White',
      tagCode,
      bloodGroup = 'B+',
      medicalNotes = '',
      fullAddress = '',
      city = 'Pune',
      state = 'Maharashtra',
      emergencyName,
      emergencyPhone,
      emergencyRelation = 'Spouse'
    } = req.body;

    if (!phone || !tagCode || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, sticker tagCode, and vehicle number are required'
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanTagCode = tagCode.trim().toUpperCase();
    const cleanPlate = vehicleNumber.trim().toUpperCase();

    // 1. Verify user does not exist
    let user = await User.findOne({ phone: cleanPhone });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'A user with this phone number already exists'
      });
    }

    // 2. Emergency contacts
    const emergencyContacts = [];
    if (emergencyName && emergencyPhone) {
      emergencyContacts.push({
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relation: emergencyRelation,
        isPrimary: true
      });
    }

    // 3. Create User tagged to this Sales Person
    user = await User.create({
      name: name?.trim() || `Owner (${cleanPlate})`,
      phone: cleanPhone,
      email: email?.trim() || null,
      password,
      role: 'user',
      bloodGroup,
      medicalNotes,
      address: {
        fullAddress: fullAddress || '',
        city: city || 'Pune',
        state: state || 'Maharashtra'
      },
      createdBy: req.user?._id || null,
      soldBy: req.user?._id || null,
      emergencyContacts,
      status: 'ACTIVE'
    });

    // 4. Create Vehicle
    const vehicle = await Vehicle.create({
      vehicleNumber: cleanPlate,
      vehicleType,
      vehicleModel,
      vehicleColor,
      user: user._id,
      isPrimary: true
    });

    user.primaryVehicle = vehicle._id;
    user.vehicles = [vehicle._id];
    await user.save();

    // 5. Claim / Create Tag
    let tag = await Tag.findOne({ tagCode: cleanTagCode });
    const clientBaseUrl = getClientBaseUrl(req);
    const scanUrl = `${clientBaseUrl}/scan/${cleanTagCode}`;

    if (!tag) {
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: { dark: '#000000', light: '#ffffff' }
      });

      tag = await Tag.create({
        tagCode: cleanTagCode,
        qrUrl: scanUrl,
        qrImageBase64: qrDataUrl,
        user: user._id,
        vehicle: vehicle._id,
        status: 'ACTIVE',
        claimedAt: new Date(),
        assignedBy: req.user?._id || null
      });
    } else {
      tag.user = user._id;
      tag.vehicle = vehicle._id;
      tag.status = 'ACTIVE';
      tag.claimedAt = new Date();
      tag.assignedBy = req.user?._id || null;
      await tag.save();
    }

    vehicle.tag = tag._id;
    await vehicle.save();

    // 6. Update salesperson statistics
    const commissionRate = req.user?.salaryOrCommissionRate || 100;
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalSalesCount: 1, totalCommissionEarned: commissionRate }
      });

      // Also update today's attendance summary if marked
      const todayStr = toDateString(new Date());
      await Attendance.findOneAndUpdate(
        { user: req.user._id, dateString: todayStr },
        { $inc: { stickersSold: 1, customersOnboarded: 1 } }
      );
    }

    res.status(201).json({
      success: true,
      message: `Customer ${user.name} onboarded successfully with sticker ${cleanTagCode}!`,
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        vehicleNumber: vehicle.vehicleNumber,
        tagCode: tag.tagCode,
        commissionEarned: commissionRate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Salesman Attendance & Working Days vs Chutti Log
 * @route   GET /api/sales/attendance
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const getAttendanceRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    const now = new Date();
    const targetYear = year ? Number(year) : now.getFullYear();
    const targetMonth = month !== undefined ? Number(month) : now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1, 0, 0, 0);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const records = await Attendance.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: -1 });

    const totalDaysWorked = records.filter(r => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
    const totalLeaves = records.filter(r => r.status === 'LEAVE').length;
    const totalWeeklyOffs = records.filter(r => r.status === 'WEEKLY_OFF').length;
    const totalHalfDays = records.filter(r => r.status === 'HALF_DAY').length;

    res.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        summary: {
          daysWorked: totalDaysWorked,
          leaves: totalLeaves,
          weeklyOffs: totalWeeklyOffs,
          halfDays: totalHalfDays
        },
        records
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark Attendance or Log Leave/Chutti for Salesman
 * @route   POST /api/sales/attendance
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const markAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      status = 'PRESENT', // PRESENT, HALF_DAY, LEAVE, WEEKLY_OFF
      workSummary = '',
      leaveReason = '',
      leaveType = 'NONE',
      hoursWorked = 8,
      date
    } = req.body;

    const targetDate = date ? new Date(date) : new Date();
    const dateStr = toDateString(targetDate);

    let record = await Attendance.findOne({ user: userId, dateString: dateStr });

    if (record) {
      record.status = status;
      record.workSummary = workSummary || record.workSummary;
      record.leaveReason = leaveReason || record.leaveReason;
      record.leaveType = leaveType || record.leaveType;
      record.hoursWorked = Number(hoursWorked) || record.hoursWorked;
      if (status === 'PRESENT' && !record.checkIn) {
        record.checkIn = new Date();
      }
      await record.save();
    } else {
      record = await Attendance.create({
        user: userId,
        date: targetDate,
        dateString: dateStr,
        status,
        checkIn: status === 'PRESENT' ? new Date() : null,
        hoursWorked: Number(hoursWorked) || (status === 'PRESENT' ? 8 : (status === 'HALF_DAY' ? 4 : 0)),
        workSummary,
        leaveReason,
        leaveType
      });
    }

    res.json({
      success: true,
      message: status === 'PRESENT' ? 'Duty attendance marked as Present!' : (status === 'LEAVE' ? 'Chutti (Leave) logged successfully' : 'Attendance updated'),
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Sales Reports (Weekly, Monthly, Yearly breakdowns)
 * @route   GET /api/sales/reports
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const getSalesReportBreakdown = async (req, res, next) => {
  try {
    const salesPersonId = req.user?._id;
    const filter = salesPersonId
      ? { $or: [{ soldBy: salesPersonId }, { createdBy: salesPersonId }], role: 'user' }
      : { role: 'user' };

    const COMMISSION_RATE = req.user?.salaryOrCommissionRate || 100;
    const now = new Date();

    // 1. WEEKLY BREAKDOWN (Past 7 days including today)
    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const count = await User.countDocuments({
        ...filter,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      weeklyData.push({
        day: dayNames[d.getDay()],
        date: toDateString(d),
        displayDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count,
        commission: count * COMMISSION_RATE
      });
    }

    // 2. MONTHLY BREAKDOWN (4 Weeks of current month)
    const monthlyData = [];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 4 buckets of ~7 days
    const weekBuckets = [
      { label: 'Week 1 (1-7)', startDay: 1, endDay: 7 },
      { label: 'Week 2 (8-14)', startDay: 8, endDay: 14 },
      { label: 'Week 3 (15-21)', startDay: 15, endDay: 21 },
      { label: 'Week 4 (22+)', startDay: 22, endDay: daysInMonth }
    ];

    for (const w of weekBuckets) {
      const start = new Date(currentYear, currentMonth, w.startDay, 0, 0, 0);
      const end = new Date(currentYear, currentMonth, w.endDay, 23, 59, 59);

      const count = await User.countDocuments({
        ...filter,
        createdAt: { $gte: start, $lte: end }
      });

      monthlyData.push({
        week: w.label,
        count,
        commission: count * COMMISSION_RATE
      });
    }

    // 3. YEARLY BREAKDOWN (12 Months of Current Year)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearlyData = [];

    for (let m = 0; m < 12; m++) {
      const start = new Date(currentYear, m, 1, 0, 0, 0);
      const end = new Date(currentYear, m + 1, 0, 23, 59, 59);

      const count = await User.countDocuments({
        ...filter,
        createdAt: { $gte: start, $lte: end }
      });

      yearlyData.push({
        month: monthNames[m],
        monthIndex: m + 1,
        count,
        commission: count * COMMISSION_RATE,
        target: req.user?.monthlyTarget || 50
      });
    }

    res.json({
      success: true,
      data: {
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData,
        commissionRate: COMMISSION_RATE
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit Daily Work Activity Report by Sales Agent
 * @route   POST /api/sales/submit-report
 * @access  Private (Sales, Admin, SuperAdmin)
 */
const submitSalesReport = async (req, res, next) => {
  try {
    const {
      tasksSummary,
      stickersAssignedOrSold = 1,
      usersOnboarded = 1,
      revenueGenerated = 299,
      hoursWorked = 8,
      leadsContacted = 5,
      notesAndFeedback = ''
    } = req.body;

    if (!tasksSummary) {
      return res.status(400).json({ success: false, message: 'Tasks summary is required' });
    }

    const report = await TeamReport.create({
      user: req.user._id,
      memberName: req.user.name,
      memberPhone: req.user.phone,
      role: 'sales',
      department: req.user.department || 'Field Sales',
      period: 'DAILY',
      reportDate: new Date(),
      tasksSummary,
      stickersAssignedOrSold: Number(stickersAssignedOrSold),
      usersOnboarded: Number(usersOnboarded),
      revenueGenerated: Number(revenueGenerated),
      hoursWorked: Number(hoursWorked),
      leadsContacted: Number(leadsContacted),
      notesAndFeedback,
      status: 'SUBMITTED'
    });

    // Also sync with today's attendance record
    const todayStr = toDateString(new Date());
    await Attendance.findOneAndUpdate(
      { user: req.user._id, dateString: todayStr },
      {
        $set: {
          status: 'PRESENT',
          hoursWorked: Number(hoursWorked),
          workSummary: tasksSummary,
          notes: notesAndFeedback
        },
        $inc: {
          stickersSold: Number(stickersAssignedOrSold),
          customersOnboarded: Number(usersOnboarded)
        }
      },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Daily sales work report submitted successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySalesStats,
  getMyAddedUsers,
  getCustomerDetails,
  updateCustomer,
  deleteCustomer,
  onboardCustomer,
  getAttendanceRecords,
  markAttendance,
  getSalesReportBreakdown,
  submitSalesReport
};
