import mongoose from "mongoose";

const transparencyReportSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    fundUsageDescription: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    totalSupportReceived: { type: Number, default: 0 },
    totalSupportUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TransparencyReport = mongoose.model("TransparencyReport", transparencyReportSchema);