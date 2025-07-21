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
      <div dir="rtl" class="verify-email"
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
        <header style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="color: #b01515; margin: 0; font-size: 28px;">RENTCAR Morocco</h1>
        </header>
        <div style="padding: 20px 0; text-align: center;">
            <h3 style="color: #333333; font-size: 22px; margin-bottom: 15px;">خطوة هامة للانضمام إلى RENTCAR Morocco</h3>
            <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">مرحباً بشريكنا الجديد!</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                نحن متحمسون لانضمام شركتكم إلى عائلة RENTCAR Morocco. لإكمال عملية تسجيل الشراكة والتحقق من بيانات شركتكم، يرجى الضغط على الزر أدناه لتحميل المستندات المطلوبة.
            </p>
            <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                الرجاء التأكد من إرفاق جميع الأوراق والوثائق المطلوبة بدقة لضمان سرعة إتمام مراجعة طلبكم.
            </p>
            <a href="${uploadDocumentLink}" style="text-decoration: none;">
                <button
                    style="background-color: #b01515; color: #ffffff; padding: 12px 25px; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; transition: background-color 0.3s ease;">
                    تحميل وثائق الشركة
                </button>
            </a>
            <p style="color: #777777; font-size: 14px; margin-top: 30px;">
                * ملاحظة: رابط تحميل الوثائق صالح لمدة <span style="font-weight: bold; color: #d9534f;">24 ساعة فقط</span>
                من وقت استلام الرسالة.
            </p>
        </div>
        <footer
            style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px; color: #999999; font-size: 12px; line-height: 1.4;">
            <p style="margin: 5px 0;">هذه الرسالة وأي روابط تحتويها سرية ويجب عدم مشاركتها.</p>
            <p style="margin: 5px 0;">يرجى تجاهل هذه الرسالة إذا لم تكن موجهة إليك.</p>
            <p style="margin: 5px 0;">نتطلع للعمل معكم، فريق RENTCAR Morocco.</p>
        </footer>
</div>

    `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendAgreementEmail;
