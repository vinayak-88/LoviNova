const brevo = require("../config/email");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function sendOTP(email, otp) {
  try {
    await brevo.sendTransacEmail({
      sender: { email: process.env.EMAIL_USER, name: "Lovinova" },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });
  } catch (error) {
    throw new Error("Failed to send OTP");
  }
}

// async function sendOTP(transporter, email, otp) {
//   await transporter.sendMail({
//     from: `"Lovinova" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
//   });
// }

module.exports = { generateOTP, sendOTP };
