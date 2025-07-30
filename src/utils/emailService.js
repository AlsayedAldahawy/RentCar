// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Gething the mail template
const fs = require('fs');
const path = require('path');

const emailHtmlTemplatePath = path.join(__dirname, 'mailTemplates', 'verificationMail.html');
const emailTemplate = fs.readFileSync(emailHtmlTemplatePath, 'utf8');

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

    const finalHtml = emailTemplate.replace('${verificationLink}', verificationLink);


    const mailOptions = {
        from: `"RentCar Morocco" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify your email',
        html: finalHtml
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
