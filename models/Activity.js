import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    location: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);