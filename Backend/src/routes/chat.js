const express = require("express");
const { userAuth } = require("../middlewares/auth");
const mongoose = require("mongoose");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const ConnectionRequest = require("../models/connectionRequest");
const { USER_SAFE_DATA } = require("../utils/constants");

const chatRouter = express.Router();

chatRouter.get("/chats", userAuth, async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: loggedInUserId,
    }).populate("participants", USER_SAFE_DATA);

    const cleanedConversations = conversations
      .map((convo) => {
        const otherParticipants = convo.participants.filter(
          (p) => p._id.toString() !== loggedInUserId.toString()
        );
        const lastOpened = convo.lastOpened.get(loggedInUserId.toString());
        const lastMessageAt = convo.lastMessageAt || convo.updatedAt;
        const isUnread =
          !lastOpened || new Date(lastMessageAt) > new Date(lastOpened);

        return {
          ...convo.toObject(),
          participants: otherParticipants,
          otherUser: otherParticipants[0]
            ? {
                ...otherParticipants[0].toObject(),
                name: `${otherParticipants[0].firstName || ""} ${
                  otherParticipants[0].lastName || ""
                }`.trim(),
                avatar:
                  otherParticipants[0]?.profilePicture?.url ||
                  "/default-avatar.png",
              }
            : null,
          lastMessage: convo.lastMessage,
          updatedAt: convo.updatedAt,
          isUnread,
        };
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.status(200).json({ data: cleanedConversations });
  } catch (err) {
    next(err);
  }
});

chatRouter.get("/chat/:conversationId", userAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const loggedInUserId = req.user._id;

    //validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId))
      throw new Error("Invalid chat ID");

    // check if conversation exist
    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new Error("Conversation not found");

    //find all messages of this conversation
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    //update lastopened in the convo
    convo.lastOpened.set(loggedInUserId.toString(), new Date());
    await convo.save();

    // find the other participant (receiver)
    const receiverId = convo.participants.find(
      (p) => p.toString() !== loggedInUserId.toString()
    );

    //get loggedInUser's last sent message
    const lastMessageByUser = await Message.findOne({
      conversationId: convo._id,
      senderId: loggedInUserId,
    }).sort({ createdAt: -1 }); // latest message sent by me

    //check if loggedinuser's message has been read by receiver
    let allMyMessagesRead = false;
    if (lastMessageByUser) {
      const receiverLastOpened = convo.lastOpened.get(receiverId.toString());
      if (
        receiverLastOpened &&
        lastMessageByUser.createdAt <= receiverLastOpened
      ) {
        allMyMessagesRead = true;
      }
    }

    res.status(200).json({ data: messages, allMyMessagesRead });
  } catch (err) {
    next(err);
  }
});

chatRouter.post("/chat/:matchId/message", userAuth, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const loggedInUserId = req.user._id;
    let { message } = req.body;

    if (message === undefined || message === null) {
      throw new Error("Message cannot be empty");
    }

    message = String(message).trim();

    if (message.length === 0) throw new Error("Message cannot be empty");
    if (message.length > 1000) throw new Error("Message is too long");

    //check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [matchId, loggedInUserId] },
    });

    if (!conversation) {
      //check if connection exists
      const connectionExists = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { senderId: matchId, receiverId: loggedInUserId },
          { senderId: loggedInUserId, receiverId: matchId },
        ],
      });

      if (!connectionExists) throw new Error("Connection does not exists");

      //if connection exists then create a new conversation
      conversation = new Conversation({
        participants: [matchId, loggedInUserId].sort(),
      });

      await conversation.save();
    }

    const sendMessage = new Message({
      senderId: loggedInUserId,
      receiverId: matchId,
      text: message,
      conversationId: conversation._id,
    });

    await sendMessage.save();

    conversation.lastMessage = message;
    conversation.lastMessageAt = Date.now();
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(200).json({
      message: "Message sent successfully",
      data: sendMessage,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = chatRouter;
