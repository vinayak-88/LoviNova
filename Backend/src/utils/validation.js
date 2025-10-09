const validator = require("validator");
const userModel = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const mongoose = require("mongoose");
const BlockedUser = require("../models/block");
const { USER_SAFE_DATA } = require("./constants");
const sanitize = require("sanitize-html");
const { sanitizeData } = require("./sanitize");

const validateSignUpData = (req) => {
  const { emailId, password, age, lookingFor } = req.body;

  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  } else if (isNaN(age)) {
    throw new Error("Age must be a number");
  } else if (!Number.isInteger(age) || age < 18) {
    throw new Error("Age must be a number and 18 or above");
  }

  const allowedLookingFor = ["Male", "Female", "Both"];
  if (!allowedLookingFor.includes(lookingFor)) {
    throw new Error("Invalid selection for lookingFor");
  }
};

const validateLoginData = (req) => {
  const { emailId, password } = req.body;

  if (!validator.isEmail(emailId)) {
    throw new Error("Enter a valid email address");
  }
  validatePassword(password);
};

const validateUpdateData = (req) => {
  const allowedUpdate = USER_SAFE_DATA.split(" ");
  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    throw new Error("No update data provided");
  }

  const invalidFields = updates.filter((k) => !allowedUpdate.includes(k));
  if (invalidFields.length > 0) {
    throw new Error(
      `Invalid field(s): ${invalidFields.join(
        ", "
      )}. Allowed fields are: ${allowedUpdate.join(", ")}`
    );
  }
};

const validateSentRequest = async ({ senderId, receiverId, status }) => {
  if (!/^[a-fA-F0-9]{24}$/.test(receiverId))
    throw new Error("Invalid receiverId"); //regex check for correct receiverId

  status = status.toLowerCase();
  const allowedStatus = ["interested", "ignored"];
  if (!allowedStatus.includes(status))
    throw new Error(
      `Invalid request type: ${status}. Allowed: ${allowedStatus.join(", ")}`
    );

  if (senderId.equals(receiverId))
    throw new Error("Can't send connection request to yourself");

  const isUserExist = await userModel.findById(receiverId);
  if (!isUserExist) throw new Error("User doesn't exist");

  const requestExist = await ConnectionRequest.findOne({
    $or: [
      { senderId, receiverId, status: { $ne: "rejected" } },
      {
        senderId: receiverId,
        receiverId: senderId,
        status: { $ne: "rejected" },
      }, //so that if got rejected, then can send request again
    ],
  });

  if (requestExist) throw new Error("Request already exist");
};

const validateReviewRequest = async ({ loggedInUserId, requestId, status }) => {
  //validating status
  const allowedStatus = ["accepted", "ignored"];
  if (!allowedStatus.includes(status))
    throw new Error("Invalid request status");

  //validating requestId
  if (!/^[a-fA-F0-9]{24}$/.test(requestId))
    throw new Error("Invalid requestId");

  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    receiverId: loggedInUserId, //makes sure the correct person is accepting requet
    status: "interested",
  });

  if (!connectionRequest) throw new Error("Connection request not found");

  return connectionRequest;
};

const forgotPasswordValidation = async (email) => {
  if (!validator.isEmail(email)) throw new Error("Invalid Email ID");

  const userExist = await userModel.findOne({ emailId: email });
  if (!userExist) throw new Error("Pls enter correct Email ID");

  return userExist;
};

const validatePassword = (password) => {
  if (typeof password !== "string") throw new Error("Invalid Password Format");

  const regex = /^[\x21-\x7E]+$/;
  if (!regex.test(password)) throw new Error("Invalid Password Format");

  const urlPattern = /https?:\/\//i;
  if (urlPattern.test(password)) throw new Error("Invalid Password Format");

  if (!validator.isStrongPassword(password))
    throw new Error("Password does not meet the criteria");
};

const blockValidation = async ({ blocker, blocked }) => {
  if (!mongoose.Types.ObjectId.isValid(blocked))
    throw new Error("Invalid User ID");

  if (blocker.toString() === blocked.toString())
    throw new Error("You cannot block yourself");

  const userExist = await userModel.findById(blocked);
  if (!userExist) throw new Error("User does not exist");

  const blockExist = await BlockedUser.findOne({
    blocker: blocker,
    blocked: blocked,
  });

  if (blockExist) throw new Error("User already blocked");
};

const validateAndNormalizeCity = (city) => {
  if (!city || typeof city !== "string") {
    throw new Error("City is required and must be a string");
  }

  // Sanitize HTML/JS input
  city = sanitizeData(city);

  // Remove invalid characters (allow letters, spaces, hyphens, apostrophes, commas, periods)
  city = city.replace(/[^a-zA-Z\s',.-]/g, "");

  // Normalize spaces
  let normalizedCity = city.replace(/\s+/g, " ").trim().toLowerCase();

  if (!normalizedCity) {
    throw new Error("Please enter a valid city");
  }

  // Length check (realistic city names)
  if (normalizedCity.length < 2 || normalizedCity.length > 50) {
    throw new Error("City must be between 2 and 50 characters");
  }

  // Capitalize each word
  normalizedCity = normalizedCity
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return normalizedCity;
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateUpdateData,
  validateSentRequest,
  validateReviewRequest,
  forgotPasswordValidation,
  validatePassword,
  blockValidation,
  validateAndNormalizeCity
};
