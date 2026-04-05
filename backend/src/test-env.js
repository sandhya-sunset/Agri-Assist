const path = require('path');
const dotenv = require('dotenv');

// Replicate the server.js logic
const envPath = path.join(__dirname, '../../.env');
console.log('Target Env Path:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log('Error loading .env:', result.error.message);
} else {
  console.log('Successfully loaded .env');
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('KHALTI_SECRET_KEY exists:', !!process.env.KHALTI_SECRET_KEY);
  console.log('KHALTI_SECRET_KEY value (redacted):', process.env.KHALTI_SECRET_KEY ? process.env.KHALTI_SECRET_KEY.substring(0, 4) + '...' : 'none');
}
