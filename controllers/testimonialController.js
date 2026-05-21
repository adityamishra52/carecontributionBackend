import { asyncHandler } from "../middleware/asyncHandler.js";
import { Testimonial } from "../models/Testimonial.js";

export const createTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatarUrl = `/uploads/${req.file.filename}`;
  }
  const created = await Testimonial.create(payload);
  res.status(201).json(created);
});

export const getTestimonials = asyncHandler(async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ createdAt: -1 });
    res.json(Array.isArray(data) ? data : []);
  } catch {
    res.json([]);
  }
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatarUrl = `/uploads/${req.file.filename}`;
  }
  const updated = await Testimonial.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!updated) {
    res.status(404);
    throw new Error("testimonial not found");
  }
  res.json(updated);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const deleted = await Testimonial.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("testimonial not found");
  }
  res.json({ message: "testimonial deleted" });
});
