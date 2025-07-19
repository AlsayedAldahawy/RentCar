// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAgreementEmail = async (to) => {

    const agreementFileLink = `https://drive.google.com/file/d/1G2n8a822Guj2J4TBVWlAqi-fGdySnYd4/view?usp=sharing`;

    const mailOptions = {
        from: `"RentCar Morocco" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Agreement file',
        html: `
      <h3>Agreement file</h3>
      <p>Please click the link below to download the agreement file:</p>
      <a href="${agreementFileLink}">Agreement file</a>
      <br> <br>
      <p>* Note: As soon as you sign and send these files, we will send you the verification link to log in to the website.</p>
    `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendAgreementEmail;
