import { asyncHandler } from "../middleware/asyncHandler.js";
import { Activity } from "../models/Activity.js";

function activityImageUrl(activityId, index) {
  return `/api/activities/${activityId}/images/${index}`;
}

function publicActivity(activity) {
  if (!activity) return null;
  const value = typeof activity.toObject === "function" ? activity.toObject() : activity;
  const { imageFiles, ...publicValue } = value;

  if (Array.isArray(value.imageFiles) && value.imageFiles.length) {
    publicValue.images = value.imageFiles.map((_, index) =>
      activityImageUrl(value._id, index)
    );
  }

  return publicValue;
}

function filesToImageFiles(files = []) {
  return files.map((file) => ({
    data: file.buffer,
    contentType: file.mimetype,
    filename: file.originalname,
    size: file.size,
  }));
}

export const createActivity = asyncHandler(async (req, res) => {
  const { title, category, description, date, location, featured } = req.body;
  const imageFiles = filesToImageFiles(req.files || []);
  if (!title || !category || !description) {
    res.status(400);
    throw new Error("title, category and description are required");
  }
  const created = await Activity.create({
    title,
    category,
    description,
    date,
    location,
    imageFiles,
    featured: featured === true || featured === "true",
  });

  const activity = await Activity.findById(created._id).select("+imageFiles.data +imageFiles");
  res.status(201).json(publicActivity(activity));
});

export const getActivities = asyncHandler(async (req, res) => {
  try {
    const data = await Activity.find()
      .select("+imageFiles.data +imageFiles")
      .sort({ createdAt: -1 });
    res.json(Array.isArray(data) ? data.map(publicActivity) : []);
  } catch {
    res.json([]);
  }
});

export const updateActivity = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.files?.length) {
    payload.imageFiles = filesToImageFiles(req.files);
    payload.images = [];
  }
  if (typeof payload.featured === "string") {
    payload.featured = payload.featured === "true";
  }

  const updated = await Activity.findByIdAndUpdate(req.params.id, payload, { new: true })
    .select("+imageFiles.data +imageFiles");
  if (!updated) {
    res.status(404);
    throw new Error("activity not found");
  }
  res.json(publicActivity(updated));
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const deleted = await Activity.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("activity not found");
  }
  res.json({ message: "activity deleted" });
});

export const getActivityImage = asyncHandler(async (req, res) => {
  const index = Number(req.params.index);

  if (!Number.isInteger(index) || index < 0) {
    res.status(400);
    throw new Error("invalid image index");
  }

  const activity = await Activity.findById(req.params.id).select(
    "+imageFiles.data +imageFiles"
  );

  const image = activity?.imageFiles?.[index];

  if (!image?.data?.length) {
    res.status(404);
    throw new Error("activity image not found");
  }

  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.set("Vary", "Origin");
  res.contentType(image.contentType || "application/octet-stream");
  res.send(image.data);
});
