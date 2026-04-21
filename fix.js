const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/Components/MessagesSection.jsx',
  'frontend/src/Components/ProductsSection.jsx',
  'frontend/src/Components/auth/OTPVerification.jsx',
  'frontend/src/pages/CartPage.jsx',
  'frontend/src/pages/WishlistPage.jsx',
  'frontend/src/pages/NotificationPage.jsx',
  'frontend/src/pages/LandingPage.jsx',
  'frontend/src/pages/DiseaseDetection.jsx',
  'frontend/src/pages/ProductListPage.jsx',
  'frontend/src/pages/UserProductPage.jsx',
  'frontend/src/Components/auth/ForgotPassword.jsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes('http://localhost:5000')) {
    // Specifically target API_BASE_URL setup in OTP/ForgotPwd
    content = content.replace(/const API_BASE_URL = ["'`]http:\/\/localhost:5000\/api["'`];/g, 'const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;');

    // DiseaseDetection API base URL
    content = content.replace(/const apiBaseUrl = ["'`]http:\/\/localhost:5000["'`];/g, 'const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";');

    // Replace strings inside template literals (e.g., `http://localhost:5000/...` -> `${import.meta.env...}/...`)
    content = content.replace(/`http:\/\/localhost:5000\//g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/');
    
    // Replace strings in quotes (e.g., "http://localhost:5000/..." -> `${import.meta.env...}/...`)
    content = content.replace(/["']http:\/\/localhost:5000\/([^"']*)["']/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/$1`');
    
    fs.writeFileSync(fullPath, content);
    console.log(f + ' updated');
  }
});

