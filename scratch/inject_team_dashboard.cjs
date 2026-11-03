const fs = require('fs');
const filePath = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `{activeTab === 'team' && (
        <div className="space-y-4">
          {/* Team Quick Filter Pills & Add Action Bar */}`;

const targetCRLF = `{activeTab === 'team' && (\r\n        <div className="space-y-4">\r\n          {/* Team Quick Filter Pills & Add Action Bar */}`;

const replacement = `{activeTab === 'team' && (
        <div className="space-y-6">
          {/* Team Performance & Sales Growth Dashboard */}
          <AdminTeamDashboard
            displayTeam={displayTeam}
            totalStaffCount={totalStaffCount}
            activeStaffCount={activeStaffCount}
            blockedStaffCount={blockedStaffCount}
            totalStaffSales={totalStaffSales}
            totalStaffCommission={totalStaffCommission}
            onAddStaff={() => setAddTeamModalOpen(true)}
          />

          {/* Team Quick Filter Pills & Add Action Bar */}`;

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced CRLF target!');
} else if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced LF target!');
} else {
  console.error('Target not found!');
  process.exit(1);
}
