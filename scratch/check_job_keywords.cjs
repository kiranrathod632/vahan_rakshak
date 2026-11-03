const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist') searchFiles(full);
    } else if (f.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (/job posts|job status|job postings|hire rate|hires ·|interview/i.test(l)) {
          console.log(`${full}:${idx+1} -> ${l.trim()}`);
        }
      });
    }
  }
}

searchFiles('frontend/src');
