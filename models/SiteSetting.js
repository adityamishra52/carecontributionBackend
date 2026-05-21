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
    impactStats: {
      type: [
        {
          label: { type: String, trim: true, required: true },
          value: { type: Number, min: 0, default: 0 },
        },
      ],
      default: [
        { label: "Meals Distributed", value: 320 },
        { label: "Animals Helped", value: 248 },
        { label: "Trees Planted", value: 140 },
        { label: "Families Supported", value: 72 },
        { label: "Support Tracked", value: 54 },
      ],
    },
    disclaimer: {
      type: String,
      default: "This is a personal community support initiative, not a registered NGO.",
      trim: true,
    },
  },
  { timestamps: true }
);

export const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);
