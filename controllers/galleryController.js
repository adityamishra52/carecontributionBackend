import { asyncHandler } from "../middleware/asyncHandler.js";
import { GalleryImage } from "../models/GalleryImage.js";

const publicGalleryFields =
  "title category imageUrl imageMimeType imageFilename imageSize caption createdAt updatedAt";

function buildGalleryImageUrl(id) {
  return `/api/gallery/${id}/image`;
}

function toPublicGalleryImage(image, includeBase64 = false) {
  if (!image) return null;

  const value = typeof image.toObject === "function" ? image.toObject() : image;
  const { imageData, ...publicImage } = value;

  if (!publicImage.imageUrl && publicImage._id) {
    publicImage.imageUrl = buildGalleryImageUrl(publicImage._id);
  }

  // Include base64 data URI if requested and data is available
  if (includeBase64 && imageData && publicImage.imageMimeType) {
    const base64 = imageData.toString("base64");
    publicImage.imageUrl = `data:${publicImage.imageMimeType};base64,${base64}`;
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

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image file is required",
    });
  }

  const image = await GalleryImage.create({
    title,
    category,
    caption,
    imageUrl: `/api/gallery/pending/image`,
    imageData: req.file.buffer,
    imageMimeType: req.file.mimetype,
    imageFilename: req.file.originalname,
    imageSize: req.file.size,
  });

  // Update URL to include the actual ID
  image.imageUrl = buildGalleryImageUrl(image._id);
  await image.save();
  
  console.debug("[GalleryController] uploadGalleryImage success", {
    id: image._id,
    imageUrl: image.imageUrl,
    size: image.imageSize,
  });

  // Fetch with imageData included (it has select: false by default)
  const savedImage = await GalleryImage.findById(image._id).select("+imageData");

  return res.status(201).json({
    success: true,
    image: toPublicGalleryImage(savedImage, true),
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
    images: Array.isArray(images) ? images.map(toPublicGalleryImage) : [],
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
    });
  }

  return res.status(200).json({
    success: true,
    message: "Image updated successfully",
    image: toPublicGalleryImage(updated),
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
    });
  }

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});
