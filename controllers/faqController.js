import { asyncHandler } from "../middleware/asyncHandler.js";
import { FAQItem } from "../models/FAQItem.js";

export const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) {
    res.status(400);
    throw new Error("question and answer are required");
  }
  const faq = await FAQItem.create({ question, answer, category });
  res.status(201).json(faq);
});

export const getFAQs = asyncHandler(async (req, res) => {
  try {
    const data = await FAQItem.find().sort({ createdAt: -1 });
    res.json(Array.isArray(data) ? data : []);
  } catch {
    res.json([]);
  }
});

export const deleteFAQ = asyncHandler(async (req, res) => {
  const deleted = await FAQItem.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("faq not found");
  }
  res.json({ message: "faq deleted" });
});

export const updateFAQ = asyncHandler(async (req, res) => {
  const updated = await FAQItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) {
    res.status(404);
    throw new Error("faq not found");
  }
  res.json(updated);
});
