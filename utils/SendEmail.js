//https://www.youtube.com/watch?v=QDIOBsMBEI0

const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const sendEmail = async (email, subject, message) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: message,
  });
};

const sendVerificationEmail = async (email, _id) => {
  const token = jwt.sign({ _id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: process.env.EMAIL_TOKEN_EXPIRATION_TIME,
  });

  const subject = "Account Activation Link";
  const message = `<h2>Please click on given link to activate your account. This link will expire in 20 minutes</h2>
  <p>${process.env.BASE_URL}/api/auth/authentication/${token}</p>
  `;

  sendEmail(email, subject, message);
};

const sendResetPasswordEmail = async (email, _id) => {
  const token = jwt.sign({ _id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: process.env.EMAIL_TOKEN_EXPIRATION_TIME,
  });

  const subject = "Account Password Reset Link";
  const message = `<h2>Please click on given link to reset your account password. This link will expire in 20 minutes</h2>
  <p>${process.env.BASE_URL}/api/auth/reset-password/${token}</p>
  `;

  sendEmail(email, subject, message);
};

module.exports = { sendResetPasswordEmail, sendVerificationEmail };
