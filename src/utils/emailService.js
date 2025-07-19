// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (to, token, role = 'user') => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/api/verify/${role}?token=${token}`;

    const mailOptions = {
        from: `"RentCar Morocco" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify your email',
        html: `
      <h3>Email Verification</h3>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <br> <br>
      <p>* Note: The link expires after 1 hour from recieving it.</p>
    `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
