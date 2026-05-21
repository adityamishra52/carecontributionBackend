import mongoose from "mongoose";

const transparencyReportSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    fundUsageDescription: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    imageData: { type: Buffer, select: false },
    imageMimeType: { type: String, trim: true },
    imageFilename: { type: String, trim: true },
    imageSize: { type: Number, min: 0 },
    totalSupportReceived: { type: Number, default: 0 },
    totalSupportUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TransparencyReport = mongoose.model("TransparencyReport", transparencyReportSchema);
