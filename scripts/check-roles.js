const path = require('path');
const langs = ['en', 'de', 'fr', 'es', 'zh', 'pt', 'pl', 'ko', 'ru', 'tr'];

console.log('=== CHECKING CreateBuild.roles ===\n');

langs.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const file = require(filePath);
  const roles = file.CreateBuild?.roles || {};
  const hasMount = !!roles.mount;
  const total = Object.keys(roles).length;
  console.log(`${lang.toUpperCase()}: ${total} roles, mount: ${hasMount ? '✅' : '❌'}`);
});

console.log('\n=== DONE ===');
