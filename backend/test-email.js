require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

console.log('Testing with:');
console.log('User:', EMAIL_USER);
console.log('Pass:', EMAIL_PASS ? '********' : 'MISSING');
console.log('Service:', EMAIL_SERVICE);

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const mailOptions = {
  from: EMAIL_USER,
  to: EMAIL_USER, // send to self
  subject: 'Test Email from Agri-Assist',
  text: 'If you see this, your email configuration is correct!',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error occurred:', error.message);
  } else {
    console.log('Email sent successfully!');
    console.log('Response:', info.response);
  }
});
