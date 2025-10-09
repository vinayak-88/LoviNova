function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}
async function sendOTP(transporter, email, otp) {
  await transporter.sendMail({
    from: `"Lovinova" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  });
}

module.exports = { generateOTP, sendOTP };
