// utils/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// Gething the mail template
const fs = require('fs');
const path = require('path');

const emailHtmlTemplatePath = path.join(__dirname, 'mailTemplates', 'randomPasswordMail.html');
const emailTemplate = fs.readFileSync(emailHtmlTemplatePath, 'utf8');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendCompRegistEmail = async (to, pass) => {

    const finalHtml = emailTemplate.replace('${temporaryPassword}', pass);


    const mailOptions = {
        from: `"RentCar Morocco" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Company Registered',
        html: finalHtml,
    };

    await transporter.sendMail(mailOptions);
};

function generateRandomPassword(length = 12) {
    const buffer = crypto.randomBytes(length);
    return buffer.toString('base64').slice(0, length)
        .replace(/\+/g, 'A')
        .replace(/\//g, 'B');
}

module.exports = {sendCompRegistEmail, generateRandomPassword};
