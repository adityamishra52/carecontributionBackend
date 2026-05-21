import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled image",
    },

    category: {
      type: String,
      required: true,
      trim: true,
      default: "general",
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    imageData: {
      type: Buffer,
      required: false,
      select: false,
    },

    imageMimeType: {
      type: String,
      trim: true,
      default: "image/jpeg",
    },

    imageFilename: {
      type: String,
      trim: true,
    },

    imageSize: {
      type: Number,
      min: 0,
    },

    caption: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const GalleryImage = mongoose.model("GalleryImage", galleryImageSchema);
