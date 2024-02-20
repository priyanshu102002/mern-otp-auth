import nodemailer from "nodemailer";
import errorHandler from "./errorHandler.js";

const mailer = async (reciverEmail, otpCode) => {
    if (!reciverEmail || !otpCode) {
        return errorHandler(400, "Email is required");
    }

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: process.env.COMPANY_EMAIL,
        to: reciverEmail,
        subject: "OTP for Mern Auth Otp Verification",
        text: "Your OTP is " + otpCode,
        html: "<b>Your OTP is " + otpCode + "</b>",
    });

    if (info.messageId) {
        return true;
    }
    return false;
};

export default mailer;
