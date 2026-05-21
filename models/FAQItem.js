import mongoose from "mongoose";

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: "general", trim: true },
  },
  { timestamps: true }
);

export const FAQItem = mongoose.model("FAQItem", faqItemSchema);