// utils/emailService.js
const nodemailer = require('nodemailer');


// Gething the mail template
const fs = require('fs');
const path = require('path');

const emailHtmlTemplatePath = path.join(__dirname, 'mailTemplates', 'agreementFileMail.html');
const emailTemplate = fs.readFileSync(emailHtmlTemplatePath, 'utf8');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAgreementEmail = async (to) => {

    const agreementFileLink = `https://drive.google.com/file/d/1G2n8a822Guj2J4TBVWlAqi-fGdySnYd4/view?usp=sharing`;
    const finalHtml = emailTemplate.replace('${agreementFileLink}', agreementFileLink);


    const mailOptions = {
        from: `"RentCar Morocco" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Agreement file',
        html: finalHtml,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendAgreementEmail;
