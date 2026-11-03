const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes("activeTab === 'team'")) {
    console.log(`${idx + 1}: ${l}`);
  }
});
