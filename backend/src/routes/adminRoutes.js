const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/authMiddleware');
const {
  getAdminStats,
  getAllScanners,
  updateScannerStatus,
  batchGenerateScanners,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  createAdminUser,
  updateAdminUser,
  updateUserStatus,
  getAllVehicles,
  getAllEmergencies,
  resolveEmergency,
  getAllOrders,
  getDocumentsAudit,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamMemberDossier,
  updateTeamMemberStatus,
  updateTeamSalaryIncentive,
  payTeamSalary,
  getTeamPerformance,
  getTeamReports,
  createTeamReport
} = require('../controllers/adminController');

// All routes are guarded by adminAuth (accepts either X-ADMIN-KEY or Bearer JWT with role === 'admin')
router.use(adminAuth);

// 1. Dashboard Overview Stats & Analytics
router.get('/stats', getAdminStats);
router.get('/overview', getAdminStats);

// 2. QR Scanners Management & Inventory
router.get('/scanners', getAllScanners);
router.put('/scanners/:tagCode/status', updateScannerStatus);
router.post('/scanners/batch-generate', batchGenerateScanners);

// 3. User Accounts & Demographics Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUser);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

// 4. Vehicles Fleet Overview
router.get('/vehicles', getAllVehicles);

// 5. Emergency SOS & Parking Incidents Logs
router.get('/emergencies', getAllEmergencies);
router.put('/emergencies/:id/resolve', resolveEmergency);

// 6. Sticker Orders, Purchases & Revenue
router.get('/orders', getAllOrders);

// 7. Vehicle Document Expiry Audit (PUC, Insurance)
router.get('/documents', getDocumentsAudit);

// 8. Team Management (Roles: Sales, Marketing, Support, Admin)
router.get('/team', getTeamMembers);
router.get('/team/:id/dossier', getTeamMemberDossier);
router.post('/team', createTeamMember);
router.put('/team/:id', updateTeamMember);
router.put('/team/:id/status', updateTeamMemberStatus);
router.put('/team/:id/salary-incentive', updateTeamSalaryIncentive);
router.post('/team/:id/pay-salary', payTeamSalary);
router.delete('/team/:id', deleteTeamMember);
router.get('/team/performance', getTeamPerformance);
router.get('/team/reports', getTeamReports);
router.post('/team/reports', createTeamReport);

module.exports = router;
