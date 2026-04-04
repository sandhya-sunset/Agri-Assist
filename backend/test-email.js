require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    const service = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE || "gmail";
    const user = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    console.log(`Testing email sending with:`);
    console.log(`Service: ${service}`);
    console.log(`User: ${user}`);
    console.log(`Pass: ${pass ? '********' : 'NOT SET'}`);

    if (user === 'your_email@gmail.com' || pass === 'your_app_password') {
        console.error('ERROR: You are still using the placeholder values in .env file!');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        service: service,
        auth: {
            user: user,
            pass: pass,
        },
    });

    try {
        await transporter.verify();
        console.log('SUCCESS: SMTP connection verified!');
        
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to yourself
            subject: "SMTP Test Email",
            text: "If you received this, your email configuration is working correctly!",
        });
        
        console.log('SUCCESS: Email sent! Message ID:', info.messageId);
    } catch (error) {
        console.error('FAILED: Could not send email.');
        console.error('Error Details:', error);
    }
};

testEmail();
