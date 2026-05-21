import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    contributorName: { type: String, trim: true },
    supportMessage: { type: String, trim: true },
    upiId: { type: String, trim: true },
    amount: { type: Number, min: 0 },
    anonymous: { type: Boolean, default: false },
    isLeaderboardEntry: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
