const express = require("express");
const authRouter = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const userDetails = require("../utils/userDetails");
const { generateOTP, sendOTP } = require("../utils/otpUtils");
const transporter = require("../config/email");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const validator = require("validator")

const {
  validateSignUpData,
  validateLoginData,
  forgotPasswordValidation,
  validatePassword,
} = require("../utils/validation");
const { validateCity } = require("../utils/cityName");
const { sanitizeData, validateAndNormalizeName } = require("../utils/sanitize");
const { userAuth } = require("../middlewares/auth");

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // 5 requests per IP per minute
  message: {
    message: "Too many OTP requests, please try again later.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // 10 login attempts per IP in 10 min
  message: {
    message: "Too many login attempts, please try again later.",
  },
});

authRouter.get("/check-auth",userAuth, (req,res)=>{
  res.json({loggedIn:true,data:req.user})
})

authRouter.post("/signup", async (req, res, next) => {
  try {
    //validating data
    validateSignUpData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      gender,
      age,
      cityName,
      lookingFor,
    } = req.body;

    const numericAge = Number(age);

    const normalizedFirstName = validateAndNormalizeName(
      firstName,
      "First Name"
    );
    const normalizedLastName = validateAndNormalizeName(lastName, "Last Name");
    const normalizedCityName = sanitizeData(cityName);

    //location validation
    await validateCity(normalizedCityName);

    //sanitize html and check bio length
    const safeBio = sanitizeData(req.body.bio);
    if (safeBio.length > 500)
      throw new Error("Bio must be less than 500 characters");

    //checking if user already exist
    const existingUser = await userModel.findOne({ emailId });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res
          .status(400)
          .json({ message: "Email already registered. Please login" });
      } else {
        // refresh OTP if account exists but not verified
        const otp = generateOTP();
        existingUser.resetOtp = otp;
        existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;
        await existingUser.save();
        await sendOTP(transporter, emailId, otp);
        return res.json({ message: "New OTP sent to your email" });
      }
    }

    //encrypt the password
    const hashedpass = await bcrypt.hash(password, 10);

    //creating new instance of user model
    const user = new userModel({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      emailId,
      password: hashedpass,
      gender,
      age: numericAge,
      location: normalizedCityName,
      bio: safeBio,
      lookingFor,
    });
    await user.save();

    //signup verification
    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    user.resetOtp = otp.toString();
    user.otpExpiry = expiry;
    await user.save();

    await sendOTP(transporter, emailId, otp);

    res.status(200).json({
      message: "Signup successful. Please verify your email with the OTP sent.",
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/resend-otp", otpLimiter, async (req, res, next) => {
  try {
    const { emailId } = req.body;
    if(!validator.isEmail(emailId)) throw new Error("Invalid Email Id")
    const user = await userModel.findOne({ emailId });
    if (!user) throw new Error("User not found");
    if (user.isVerified) return res.json({ message: "Already verified" });

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    user.resetOtp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTP(transporter, emailId, otp);
    res.json({ message: "New OTP sent" });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const { emailId, otp } = req.body;
    if(!validator.isEmail(emailId)) throw new Error("Invalid Email Id")

    const user = await userModel.findOne({ emailId });
    if (!user) throw new Error("User not found");

    if (user.isVerified) {
      return res.status(200).json({ message: "Already verified" });
    }

    if (String(user.resetOtp) !== String(otp) || Date.now() > user.otpExpiry) {
      throw new Error("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.resetOtp = null; // cleanup
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    //validating data
    validateLoginData(req);

    //looking out for the email in db
    const { emailId, password } = req.body;

    const user = await userModel
      .findOne({ emailId: emailId })
      .select("+password");

    if (!user) throw new Error("Invalid Credentials");
    if (!user.isVerified) throw new Error("Please verify email first");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid Credentials");

    //create a JWT token
    const token = await user.getJWT();

    //convert user document to plain object and remove sensitive fields
    const safeUser = userDetails(user);

    //Add the token to cookie and send the response back to user
    res.cookie("token", token, {
      httpOnly: true,
      path: "/",
    });
    res.status(200).json({ message: "Login Successful", data: safeUser });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now() - 1000), //using time of 1 sec ago to avoid browser server clock mismatch
  });
  res.status(200).json({ message: "Logged out successfully" });
});

authRouter.post("/forgotpassword", otpLimiter, async (req, res, next) => {
  try {
    const emailId = req.body.emailId;

    //email validation
    const user = await forgotPasswordValidation(emailId);

    //otp generation
    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    user.resetOtp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTP(transporter, emailId, otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/forgotpassword/verifyotp", async (req, res, next) => {
  try {
    const email = req.body.emailId;
    const userOtp = req.body.otp.toString();

    const user = await userModel.findOne({ emailId: email });
    if (!user) throw new Error("User not found");

    //verify otp
    if (user.resetOtp !== userOtp) throw new Error("Invalid OTP");
    if (user.otpExpiry < Date.now()) throw new Error("OTP Expired");

    user.resetOtp = null; // clear OTP
    user.otpExpiry = null; // clear expiry
    await user.save();

    //create token
    const resetToken = await jwt.sign(
      { email, type: "resetPassword" },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    res
      .status(200)
      .json({ message: "OTP verified successfully", token: resetToken });
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/resetpassword", async (req, res, next) => {
  try {
    //extract token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new Error("No reset token provided");

    const { newPassword } = req.body;

    //validate token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded || decoded.type !== "resetPassword")
      throw new Error("Pls Verify OTP First");

    //checking if user exist
    const user = await userModel.findOne({ emailId: decoded.email });
    if (!user) throw new Error("User not found");

    //validate if password is strong
    validatePassword(newPassword);

    // hash new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    next(err); // for unexpected server errors
  }
});

module.exports = authRouter;
