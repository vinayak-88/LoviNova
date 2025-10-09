const mongoose = require("mongoose");

const blockedUserSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // who blocked
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // who got blocked
  },
  { timestamps: true }
);

// prevent duplicate blocks (same blocker -> blocked again)
blockedUserSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

module.exports = mongoose.model("BlockedUser", blockedUserSchema);
