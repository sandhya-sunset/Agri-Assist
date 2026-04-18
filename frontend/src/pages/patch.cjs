const fs = require('fs');
let code = fs.readFileSync('HomePage.jsx', 'utf8');
code = code.replace(
  '{blogPosts.map((post, idx) => (',
  '{displayBlogPosts.map((post, idx) => ('
);
code = code.replace(
  /\<img\s+src=\{post\.image\}\s+alt=\{post\.title\}/g,
  '<img\n                      src={post.image?.startsWith("http") ? post.image : `${API_BASE_URL}${post.image?.startsWith("/") ? "" : "/"}${post.image?.replace(/\\\\/g, "/")}`}\n                      alt={post.title}'
);
code = code.replace(
  /\<img[\s\n]+src=\{[\s\n]+product\.image\.startsWith\(\"http\"\)?[\s\n]+\? product\.image[\s\n]+\: \`\$\{API_BASE_URL\}\/\$\{product\.image\.replace\(\/\\\\\\\\\/g, \"\/\"\)\}\`[\s\n]+\}/mg,
  '<img\n                        src={product.image?.startsWith("http") ? product.image : `${API_BASE_URL}${product.image?.startsWith("/") ? "" : "/"}${product.image?.replace(/\\\\/g, "/")}`}'
);
fs.writeFileSync('HomePage.jsx', code);
console.log("Done");