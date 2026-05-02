const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && f !== 'backend') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.html') || f.endsWith('.jsx') || f.endsWith('.js')) {
        callback(dirPath);
      }
    }
  });
}

walkDir(__dirname, function(filePath) {
  if (filePath === __filename) return; // don't process this script
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace case-sensitive "ZeroHunger" and "Zero Hunger"
  // Do not replace lowercase "zerohunger" to protect auth keys, emails, URLs, etc.
  let newContent = content
    .replace(/ZeroHunger/g, 'Food Sahaya')
    .replace(/Zero Hunger/g, 'Food Sahaya');
    
  // Some exceptions like email domains if they happened to be capitalized (e.g., support@ZeroHunger.org)
  // Let's fix that back if it happened
  newContent = newContent.replace(/support@Food Sahaya\.org/gi, 'support@zerohunger.org');
  newContent = newContent.replace(/Food Sahaya_auth/g, 'zerohunger_auth');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated: ' + filePath);
  }
});
