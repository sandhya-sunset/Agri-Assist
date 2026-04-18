const fs = require('fs');
let code = fs.readFileSync('HomePage.jsx', 'utf8');
code = code.replaceAll(
  '`${API_BASE_URL}/${product.image.replace(/\\\\/g, "/")}`',
  '`${API_BASE_URL}${product.image?.startsWith("/") ? "" : "/"}${product.image?.replace(/\\\\/g, "/")}`'
);
fs.writeFileSync('HomePage.jsx', code);
console.log("Done");