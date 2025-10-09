const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const requestRouter = express.Router();
const { validateSentRequest } = require("../utils/validation");
const { validateReviewRequest } = require("../utils/validation");
const BlockedUser = require("../models/block")

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res, next) => {
    try {
      const senderId = req.user._id;
      const receiverId = req.params.userId;
      const status = req.params.status;

      await validateSentRequest({ senderId, receiverId, status });

      const hasBlockedUser = await BlockedUser.findOne({
        blocker :senderId, blocked:receiverId 
      })

      if(hasBlockedUser) throw new Error("Please unblock to send connection request")

      const blockedByUser = await BlockedUser.findOne({
        blocker : receiverId, blocked : senderId
      })
      
      if(blockedByUser) throw new Error("Can't send connection request")

      const connectionRequest = new ConnectionRequest({
        senderId,
        receiverId,
        status,
      });
      await connectionRequest.save();
      res.status(200).json({ message: "Connection request sent" });
    } catch (err) {
      next(err);
    }
  }
);

requestRouter.patch(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res, next) => {
    try {
      const loggedInUserId = req.user._id;
      const { requestId, status } = req.params;

      const connectionRequest = await validateReviewRequest({
        loggedInUserId,
        requestId,
        status,
      });

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res
        .status(200)
        .json({ message: "Connection request " + status, data: data });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = requestRouter;
