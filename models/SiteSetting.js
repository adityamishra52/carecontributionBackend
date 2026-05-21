import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    upiId: { type: String, default: "carecontribution@upi", trim: true },
    qrImageUrl: { type: String, trim: true },
    qrImageData: { type: Buffer, select: false },
    qrImageMimeType: { type: String, trim: true, default: "image/jpeg" },
    qrImageFilename: { type: String, trim: true },
    qrImageSize: { type: Number, min: 0 },
    paymentInstructions: { type: String, trim: true },
    disclaimer: {
      type: String,
      default: "This is a personal community support initiative, not a registered NGO.",
      trim: true,
    },
  },
  { timestamps: true }
);

export const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);
