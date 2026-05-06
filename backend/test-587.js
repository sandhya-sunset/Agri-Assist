require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Port 587 Test - Agri-Assist',
  text: 'Port 587 TLS works!',
}, (err, info) => {
  if (err) {
    console.error('❌ FAILED:', err.message);
  } else {
    console.log('✅ Port 587 works!', info.response);
  }
});
