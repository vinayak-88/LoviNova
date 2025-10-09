const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters long"],
      maxLength: [30, "First name can't be more than 30 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minLength: [2, "Last name must be at least 2 characters long"],
      maxLength: [30, "Last name can't be more than 30 characters"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      validate(value) {
        if (value < 18) {
          throw new Error("User should be 18 or older");
        }
      },
    },
    emailId: {
      type: String,
      required: [true, "Email address is required"],
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "{VALUE} is not supported. Choose Male, Female, or Other",
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },
    bio: {
      type: String,
      maxLength: 500,
      default: "",
    },
    profilePicture: {
      url: {
        type: String,
        default: process.env.DEFAULT_IMAGE_URL,
      },
      publicId: {
        type: String,
        trim: true,
        default: null,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    location: {
      type: String,
      required: true,
    },
    lookingFor: {
      type: String,
      enum: {
        values : ["Male", "Female", "Both"],
        message: "{VALUE} is not supported. Choose Male, Female, or Both"
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    resetOtp:{
      type : String,
      default : null
    },
    otpExpiry:{
      type : Date,
      default : null
    },
    isVerified : {
      type : Boolean,
      default : false
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id, type: "auth" }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passInputByUser) {
  const user = this;
  const hashedPass = user.password;
  const isPasswordValid = await bcrypt.compare(passInputByUser, hashedPass);

  return isPasswordValid;
};
module.exports = mongoose.model("User", userSchema);
