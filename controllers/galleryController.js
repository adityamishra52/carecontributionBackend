import { asyncHandler } from "../middleware/asyncHandler.js";
import { GalleryImage } from "../models/GalleryImage.js";

const publicGalleryFields =
  "title category imageUrl imageMimeType imageFilename imageSize caption createdAt updatedAt";

function buildGalleryImageUrl(id) {
  return `/api/gallery/${id}/image`;
}

function toPublicGalleryImage(image) {
  if (!image) return null;

  const value = typeof image.toObject === "function" ? image.toObject() : image;
  const { imageData, ...publicImage } = value;

  if (!publicImage.imageUrl && publicImage._id) {
    publicImage.imageUrl = buildGalleryImageUrl(publicImage._id);
  }

  return publicImage;
}

export const uploadGalleryImage = asyncHandler(async (req, res) => {
  const title = req.body.title?.trim() || "Untitled image";
  const category = req.body.category?.trim() || "general";
  const caption = req.body.caption?.trim() || "";

  console.debug("[GalleryController] uploadGalleryImage", {
    title,
    category,
    caption,
    fileName: req.file?.originalname,
    fileType: req.file?.mimetype,
  });

  if (!req.file && !req.body.imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Image file is required",
      data: null,
    });
  }

  const image = await GalleryImage.create({
    title,
    category,
    caption,
    imageUrl: req.file ? "/api/gallery/pending/image" : req.body.imageUrl.trim(),
    imageData: req.file?.buffer,
    imageMimeType: req.file?.mimetype,
    imageFilename: req.file?.originalname,
    imageSize: req.file?.size,
  });

  if (req.file) {
    image.imageUrl = buildGalleryImageUrl(image._id);
    await image.save();
    console.debug("[GalleryController] updateGalleryImageUrl", {
      id: image._id,
      imageUrl: image.imageUrl,
    });
  }

  const savedImage = await GalleryImage.findById(image._id).select(
    publicGalleryFields
  );

  return res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: toPublicGalleryImage(savedImage),
  });
});

export const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find()
    .select(publicGalleryFields)
    .sort({ createdAt: -1 });

  console.debug("[GalleryController] getGalleryImages", {
    count: images.length,
  });

  return res.status(200).json({
    success: true,
    data: Array.isArray(images) ? images.map(toPublicGalleryImage) : [],
  });
});

export const getGalleryImageById = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id).select(
    "+imageData imageMimeType updatedAt"
  );

  if (!image || !image.imageData?.length) {
    console.debug("[GalleryController] getGalleryImageById not found", {
      id: req.params.id,
    });

    return res.status(404).json({
      success: false,
      message: "Image not found",
      data: null,
    });
  }

  res.set("Cache-Control", "no-store");
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Content-Length", image.imageData.length);
  res.contentType(image.imageMimeType || "application/octet-stream");

  console.debug("[GalleryController] getGalleryImageById", {
    id: image._id,
    mimeType: image.imageMimeType,
  });

  return res.send(image.imageData);
});

export const updateGalleryImage = asyncHandler(async (req, res) => {
  const payload = {};

  if (typeof req.body.title === "string") {
    payload.title = req.body.title.trim() || "Untitled image";
  }

  if (typeof req.body.category === "string") {
    payload.category = req.body.category.trim() || "general";
  }

  if (typeof req.body.caption === "string") {
    payload.caption = req.body.caption.trim();
  }

  if (typeof req.body.imageUrl === "string" && req.body.imageUrl.trim()) {
    payload.imageUrl = req.body.imageUrl.trim();
  }

  if (req.file) {
    payload.imageUrl = buildGalleryImageUrl(req.params.id);
    payload.imageData = req.file.buffer;
    payload.imageMimeType = req.file.mimetype;
    payload.imageFilename = req.file.originalname;
    payload.imageSize = req.file.size;
  }

  const updated = await GalleryImage.findByIdAndUpdate(
    req.params.id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).select(publicGalleryFields);

  console.debug("[GalleryController] updateGalleryImage", {
    id: req.params.id,
    updated: Boolean(updated),
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
      data: null,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Image updated successfully",
    data: toPublicGalleryImage(updated),
  });
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const deleted = await GalleryImage.findByIdAndDelete(req.params.id);

  console.debug("[GalleryController] deleteGalleryImage", {
    id: req.params.id,
    removed: Boolean(deleted),
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
      data: null,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: { id: deleted._id },
  });
});
