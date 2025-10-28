// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// module.exports = transporter;

const Sib = require("@sendinblue/client");

const brevo = new Sib.TransactionalEmailsApi();
brevo.setApiKey(Sib.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

module.exports = brevo;

