const express = require('express');
const router = express.Router();
const { salesAuth } = require('../middlewares/authMiddleware');
const {
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
} = require('../controllers/salesController');

// All sales routes require Sales, Admin, or SuperAdmin role
router.use(salesAuth);

// 1. Get logged-in salesperson personal performance metrics & today's counts
router.get('/my-stats', getMySalesStats);

// 2. Get list of users added by this salesperson
router.get('/my-users', getMyAddedUsers);

// 3. Customer dossier (Eye button), update and delete
router.get('/customer/:id', getCustomerDetails);
router.put('/customer/:id', updateCustomer);
router.delete('/customer/:id', deleteCustomer);

// 4. Direct customer onboarding by sales agent
router.post('/onboard-user', onboardCustomer);

// 5. Attendance & Working Days vs Chutti (Leaves) Tracker
router.get('/attendance', getAttendanceRecords);
router.post('/attendance', markAttendance);

// 6. Sales Reports (Weekly, Monthly, Yearly breakdowns)
router.get('/reports', getSalesReportBreakdown);

// 7. Submit daily sales activity report
router.post('/submit-report', submitSalesReport);

module.exports = router;
