require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// ✅ Change this to the email that is NOT receiving OTP
const TEST_TO = 'np05cp4a230208@iic.edu.np';

console.log('Sending test OTP email to:', TEST_TO);
console.log('From:', EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

transporter.sendMail({
  from: EMAIL_USER,
  to: TEST_TO,
  subject: 'Email Verification - OTP',
  html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Test OTP Email</h2>
    <p>Your test OTP is:</p>
    <h1 style="color: #333; text-align: center; letter-spacing: 5px;">999999</h1>
    <p>If you received this, email delivery is working!</p>
  </div>`,
}, (error, info) => {
  if (error) {
    console.error('\n❌ FAILED to send email!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.response) console.error('SMTP Response:', error.response);
  } else {
    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\nNow check the inbox AND spam folder of:', TEST_TO);
  }
});
