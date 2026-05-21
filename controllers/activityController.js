import { asyncHandler } from "../middleware/asyncHandler.js";
import { Activity } from "../models/Activity.js";

export const createActivity = asyncHandler(async (req, res) => {
  const { title, category, description, date, location, featured } = req.body;
  const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
  if (!title || !category || !description) {
    res.status(400);
    throw new Error("title, category and description are required");
  }
  const activity = await Activity.create({
    title,
    category,
    description,
    date,
    location,
    images,
    featured: featured === true || featured === "true",
  });
  res.status(201).json(activity);
});

export const getActivities = asyncHandler(async (req, res) => {
  try {
    const data = await Activity.find().sort({ createdAt: -1 });
    res.json(Array.isArray(data) ? data : []);
  } catch {
    res.json([]);
  }
});

export const updateActivity = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.files?.length) {
    payload.images = req.files.map((file) => `/uploads/${file.filename}`);
  }
  if (typeof payload.featured === "string") {
    payload.featured = payload.featured === "true";
  }

  const updated = await Activity.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!updated) {
    res.status(404);
    throw new Error("activity not found");
  }
  res.json(updated);
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const deleted = await Activity.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("activity not found");
  }
  res.json({ message: "activity deleted" });
});
