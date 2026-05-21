import { ContactMessage } from "../models/ContactMessage.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("name, email and message are required");
  }
  const created = await ContactMessage.create({ name, email, phone, message });
  res.status(201).json(created);
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const data = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(data);
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("message not found");
  }
  res.json({ message: "contact message deleted" });
});

export const markContactMessageRead = asyncHandler(async (req, res) => {
  const updated = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: req.body.isRead === true || req.body.isRead === "true" },
    { new: true }
  );
  if (!updated) {
    res.status(404);
    throw new Error("message not found");
  }
  res.json(updated);
});