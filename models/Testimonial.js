import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    avatarData: { type: Buffer, select: false },
    avatarMimeType: { type: String, trim: true },
    avatarFilename: { type: String, trim: true },
    avatarSize: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
