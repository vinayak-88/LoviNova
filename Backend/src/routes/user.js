const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");
const userModel = require("../models/user");
const { blockValidation } = require("../utils/validation");
const BlockedUser = require("../models/block");
const { USER_SAFE_DATA } = require("../utils/constants");
const mongoose = require("mongoose");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      receiverId: userId,
      status: "interested",
    }).populate("senderId", USER_SAFE_DATA);

    if (requests.length === 0) throw new Error("No requests found");
    res
      .status(200)
      .json({ message: "List of pending requests", data: requests });
  } catch (err) {
    next(err);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    let connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ receiverId: userId }, { senderId: userId }],
    })
      .populate([
        { path: "senderId", select: USER_SAFE_DATA },
        { path: "receiverId", select: USER_SAFE_DATA },
      ])
      .lean();

    //check if connections exist
    if (connections.length === 0) {
      throw new Error("No connection found");
    }

    const userIdStr = userId.toString();

    //getting details of only the other and not the loggedinuser
    connections = connections
      .filter((conn) => conn.senderId && conn.receiverId) // avoid null populated fields
      .map((conn) => {
        const isSender = conn.senderId._id.toString() === userIdStr;
        const otherUser = isSender ? conn.receiverId : conn.senderId;

        return {
          _id: conn._id,
          otherUser,
        };
      });

    res
      .status(200)
      .json({ message: "List of All User Connections", data: connections });
  } catch (err) {
    next(err);
  }
});

userRouter.delete(
  "/user/connections/removeconnection/:userId",
  userAuth,
  async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const loggedInUserId = req.user._id;

      const deletedConnection = await ConnectionRequest.findOneAndDelete({
        status: "accepted",
        $or: [{ senderId: loggedInUserId, receiverId : userId }, { receiverId: loggedInUserId, senderId:userId }],
      });
      if (!deletedConnection) {
        // Not found case – you can throw a custom error (not really needed)
        const error = new Error("Connection not found");
        error.status = 404;
        throw error;
      }

      res.status(200).json({ message: "Connection removed successfully" });
    } catch (err) {
      next(err);
    }
  }
);

userRouter.get("/feed", userAuth, async (req, res, next) => {
  try {
    //user should see all the users except
    //1. his own card(won't exist)
    //2. his connections
    //3. ignored people
    //4. already sent the connection request

    const loggedInUserId = req.user._id;
    const { lookingFor } = req.user;

    // apply gender filter
    const genderFilter =
      lookingFor === "Both"
        ? {} // Both matlab koi restriction nahi
        : { gender: lookingFor };

    //pagination
    let page = parseInt(req.query.page) || 1; // default page 1
    let limit = parseInt(req.query.limit) || 20; // default 20 users per page
    let skip = (page - 1) * limit;

    //0. Fetch all users from db
    const allUsers = await userModel
      .find(genderFilter)
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit); //need to update safe user data

    // 1. Collect all user IDs
    const allUserIds = allUsers.map((u) => u._id);

    // 2. Fetch all not-allowed connections in ONE query and blocked users
    const notAllowed = await ConnectionRequest.find({
      $or: [
        // case: user sent request to loggedInUser (and status is not fresh)
        {
          senderId: { $in: allUserIds },
          receiverId: loggedInUserId,
          status: { $in: ["accepted", "rejected", "ignored"] },
        },
        // case: loggedInUser sent request to user (any status)
        {
          senderId: loggedInUserId,
          receiverId: { $in: allUserIds },
        },
      ],
    });

    const blockedUsers = await BlockedUser.find({
      $or: [
        { blocker: loggedInUserId, blocked: { $in: allUserIds } }, // you blocked them
        { blocked: loggedInUserId, blocker: { $in: allUserIds } }, // they blocked you
      ],
    });

    // 3. Make a set of "notallowed" user IDs and "blocked" user IDs
    const notAllowedIds = new Set(
      notAllowed.map((req) =>
        String(req.senderId) === String(loggedInUserId)
          ? String(req.receiverId)
          : String(req.senderId)
      )
    );

    blockedUsers.forEach((b) => {
      notAllowedIds.add(String(b.blocker));
      notAllowedIds.add(String(b.blocked));
    });

    // 4. Filter allowed users in-memory
    const allowedUsers = allUsers.filter(
      (u) =>
        String(u._id) !== String(loggedInUserId) && // exclude self
        !notAllowedIds.has(String(u._id)) // exclude blocked/connected
    );

    res.status(200).json({
      data: allowedUsers,
      page,
      limit,
      hasMore: allowedUsers.length === limit,
    });
  } catch (err) {
    next(err);
  }
});

userRouter.post("/block", userAuth, async (req, res, next) => {
  const session = await mongoose.startSession(); // start transaction
  session.startTransaction();
  try {
    const blocker = req.user._id;
    const { blocked } = req.body;

    await blockValidation({ blocker, blocked });

    await ConnectionRequest.deleteOne({
      $or: [
        { senderId: blocker, receiverId: blocked },
        { senderId: blocked, receiverId: blocker },
      ],
    }).session(session);
    const blockedUser = new BlockedUser({
      blocker,
      blocked,
    });
    await blockedUser.save({ session });
    await session.commitTransaction();
    session.endSession();
    res
      .status(200)
      .json({ message: "user blocked successfully", blockedUser: blocked });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});

userRouter.post("/unblock", userAuth, async (req, res, next) => {
  try {
    const blocker = req.user._id;
    let blocked = req.body._id;

    if (!mongoose.Types.ObjectId.isValid(blocked)) {
      throw { status: 400, message: "Invalid User ID" };
    }

    if (blocker.toString() === blocked.toString()) {
      throw { status: 400, message: "You cannot unblock yourself" };
    }

    // check if block record exists
    const unblockedUser = await BlockedUser.findOneAndDelete({
      blocker,
      blocked
    });
    if (!unblockedUser) {
      throw new Error("User is already unblocked");
    }

    res.status(200).json({
      message: "User unblocked successfully",
      unblockedUser: blocked,
    });
  } catch (err) {
    next(err);
  }
});

userRouter.get("/blocklist/view", userAuth, async (req, res, next) => {
  try {
    const blocker = req.user._id;

    const blockList = await BlockedUser.find({ blocker }).populate([
      { path: "blocked", select: USER_SAFE_DATA },
    ]);
    res.status(200).json({ data: blockList });
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
