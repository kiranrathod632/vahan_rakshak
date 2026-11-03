const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');
for (let i = 1699; i < 1708; i++) {
  console.log(i + ': ' + JSON.stringify(lines[i]));
}
