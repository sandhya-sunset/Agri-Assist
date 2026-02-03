const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  // For production, use environment variables for service/auth
  // For now, we'll try to use a generic SMTP or log if not configured
  
  // NOTE: This requires valid SMTP credentials in .env to actually send
  // If not present, we will log the email content for debugging
  
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('----------------------------------------------------');
    console.log('SMTP Credentials not found. Mocking email send.');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('----------------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail', // Default to gmail
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'AgriAssist'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // Optional: if we want HTML emails later
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
