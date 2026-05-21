import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    location: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    imageFiles: {
      type: [
        {
          data: { type: Buffer, select: false },
          contentType: { type: String, trim: true },
          filename: { type: String, trim: true },
          size: { type: Number, min: 0 },
        },
      ],
      default: [],
      select: false,
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);
