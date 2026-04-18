const fs = require('fs');
let code = fs.readFileSync('BlogDetail.jsx', 'utf8');
code = code.replaceAll(
  '`${API_BASE_URL}/${post.image.replace(/\\\\/g, "/")}`',
  '`${API_BASE_URL}${post.image?.startsWith("/") ? "" : "/"}${post.image?.replace(/\\\\/g, "/")}`'
);
fs.writeFileSync('BlogDetail.jsx', code);
console.log("Done");