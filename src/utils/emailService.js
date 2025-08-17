// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Gething the mail template
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const baseUrl = process.env.BASE_URL;

const sendVerificationEmail = async (to, token, role = 'user') => {
    const emailHtmlTemplatePath = path.join(__dirname, 'mailTemplates', 'verificationMail.html');
    const emailTemplate = fs.readFileSync(emailHtmlTemplatePath, 'utf8');

    const roles = ['user', 'company']

    if (!roles.includes(role)) {
        return ("Role is not valid")
    }
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
const resetPasswordEmail = async (to, token, role) => {

    const emailHtmlTemplatePath = path.join(__dirname, 'mailTemplates', 'resetPassMail.html');
    const emailTemplate = fs.readFileSync(emailHtmlTemplatePath, 'utf8');

    const roles = ['user', 'company', 'admin']

    if (!roles.includes(role)) {
        return ("Invalid role")
    }
    const baseUrl = process.env.FRONT_URL;
    const resetLink = `${baseUrl}/reset-password/${role}/${token}`;

    const finalHtml = emailTemplate.replace('${resetLink}', resetLink);


    const mailOptions = {
        from: `"RentCar Morocco" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset Your Password',
        html: finalHtml
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail,
    resetPasswordEmail
};
