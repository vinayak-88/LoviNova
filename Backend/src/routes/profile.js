const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
  validateUpdateData,
  validatePassword,
  validateAndNormalizeCity,
} = require("../utils/validation");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { isHumanFace } = require("../utils/vision");
const fs = require("fs");
const upload = require("../middlewares/upload");
const cloudinary = require("../utils/cloudinary");
const { USER_SAFE_DATA } = require("../utils/constants");
const BlockedUser = require("../models/block");
const { validateAndNormalizeName, sanitizeData } = require("../utils/sanitize");
const { validateCity } = require("../utils/cityName");
const ConnectionRequest = require("../models/connectionRequest");

profileRouter.get("/profile/view", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res, next) => {
  try {
    validateUpdateData(req);
    const loggedInUser = req.user;
    let { firstName, lastName, bio, location } = req.body;

    //Sanitize
    firstName = validateAndNormalizeName(firstName, "First Name");
    lastName = validateAndNormalizeName(lastName, "Last Name");
    bio = sanitizeData(bio);

    //sanitize and validate location
    location = validateAndNormalizeCity(location);
    await validateCity(location);

    //Obejct.keys(req.body).forEach((keys)=>loggedInUser[keys]=req.body[keys])
    Object.assign(loggedInUser, req.body); //easy to read but above is better if we want to perform some validation for each key
    //spread operator method won't work cz loggedInUser is a mongoose document and spread operator will return a plain js object and since it is a plain js object it doesn't contain .save() method which is exclusive for mongoose document

    await loggedInUser.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully", data: loggedInUser });
  } catch (err) {
    next(err); //since next is not empty and has "err" so it will skip all routes and will jump directly to error handling middleware
  }
});

profileRouter.patch(
  "/profile/passwordchange",
  userAuth,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await userModel
        .findOne({ emailId: req.user.emailId })
        .select("+password");

      if (!user) {
        throw new Error("Invalid details");
      }

      validatePassword(currentPassword);

      const isCorrect = await user.validatePassword(currentPassword);
      if (!isCorrect) throw new Error("Pls enter correct Password");

      validatePassword(newPassword);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  }
);

profileRouter.get(
  "/profile/user/view/:userId",
  userAuth,
  async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const loggedInUserId = req.user._id;
      //validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID format");
      }

      const blockedByUser = await BlockedUser.findOne({
        blocker: userId,
        blocked: loggedInUserId,
      });

      const connection = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { senderId: loggedInUserId, receiverId: userId },
          { senderId: userId, receiverId: loggedInUserId },
        ],
      });

      const connectionExist = connection ? true : false;
      let connectionId = connectionExist?connection._id : 0

      if (blockedByUser) throw new Error("Unable to show the profile");
      const userProfile = await userModel
        .findById(userId)
        .select(USER_SAFE_DATA);
      if (!userProfile) throw new Error("Invalid User ID");

      res.status(200).json({ data: userProfile, connectionExist,connectionId});
    } catch (err) {
      next(err);
    }
  }
);

profileRouter.post(
  "/upload",
  userAuth,
  upload.single("profilepic"),
  async (req, res, next) => {
    try {
      if (!req.file) throw new Error("Pls upload an image");

      //human face validation
      const imageBuffer = fs.readFileSync(req.file.path);
      await isHumanFace(imageBuffer);

      //upload to cloudinary
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "Faces",
        transformation: [
          { width: 250, height: 200, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      });

      //update user
      const user = await userModel.findById(req.user._id);
      user.profilePicture = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
        isVerified: true,
      };
      await user.save();

      // delete local file after upload (optional but good practice)
      await fs.promises.unlink(req.file.path);

      res.status(200).json({
        message: "Profile Picture uploaded successfully",
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      });
    } catch (err) {
      next(err);
    }
  }
);

profileRouter.get("/searchbyname", userAuth, async (req, res, next) => {
  try {
    let { name } = req.query; // user se fullname aaya
    if (!name) throw new Error("Name is required");

    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      throw new Error("Please enter a valid name");
    }

    if (name) {
      name = name.replace(/[^a-zA-Z\s]/g, ""); // sirf alphabets aur space allow
    }

    // normalize user input
    const normalizedName = name.trim().replace(/\s+/g, " ").toLowerCase();

    //pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let skip = (page - 1) * limit;

    const users = await userModel
      .find({
        $expr: {
          $regexMatch: {
            input: {
              $concat: [
                { $toLower: "$firstName" },
                " ",
                { $toLower: "$lastName" },
              ],
            },
            regex: `.*${normalizedName}.*`,
            options: "i", // case insensitive
          },
        },
      })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: users,
      page,
      limit,
      hasMore: users.length === limit,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = profileRouter;
