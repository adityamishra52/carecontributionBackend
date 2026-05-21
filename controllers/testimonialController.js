import { asyncHandler } from "../middleware/asyncHandler.js";
import { Testimonial } from "../models/Testimonial.js";

const avatarUrl = (id) => `/api/testimonials/${id}/avatar`;

function publicTestimonial(testimonial) {
  if (!testimonial) return null;
  const value =
    typeof testimonial.toObject === "function"
      ? testimonial.toObject()
      : testimonial;
  const { avatarData, ...publicValue } = value;

  if (value.avatarData?.length) {
    publicValue.avatarUrl = avatarUrl(value._id);
  }

  return publicValue;
}

export const createTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatarData = req.file.buffer;
    payload.avatarMimeType = req.file.mimetype;
    payload.avatarFilename = req.file.originalname;
    payload.avatarSize = req.file.size;
  }
  const created = await Testimonial.create(payload);
  const testimonial = await Testimonial.findById(created._id).select("+avatarData");
  res.status(201).json(publicTestimonial(testimonial));
});

export const getTestimonials = asyncHandler(async (req, res) => {
  try {
    const data = await Testimonial.find().select("+avatarData").sort({ createdAt: -1 });
    res.json(Array.isArray(data) ? data.map(publicTestimonial) : []);
  } catch {
    res.json([]);
  }
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatarData = req.file.buffer;
    payload.avatarMimeType = req.file.mimetype;
    payload.avatarFilename = req.file.originalname;
    payload.avatarSize = req.file.size;
  }
  const updated = await Testimonial.findByIdAndUpdate(req.params.id, payload, { new: true }).select("+avatarData");
  if (!updated) {
    res.status(404);
    throw new Error("testimonial not found");
  }
  res.json(publicTestimonial(updated));
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const deleted = await Testimonial.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("testimonial not found");
  }
  res.json({ message: "testimonial deleted" });
});

export const getTestimonialAvatar = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id).select(
    "+avatarData avatarMimeType updatedAt"
  );

  if (!testimonial || !testimonial.avatarData?.length) {
    res.status(404);
    throw new Error("testimonial avatar not found");
  }

  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.set("Vary", "Origin");
  res.contentType(testimonial.avatarMimeType || "application/octet-stream");
  res.send(testimonial.avatarData);
});
