import { asyncHandler } from "../middleware/asyncHandler.js";
import { Newsletter } from "../models/Newsletter.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const subscribeToNewsletter = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Email already subscribed",
    });
  }

  try {
    await Newsletter.create({ email });
    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already subscribed",
      });
    }
    throw error;
  }
});

export const testNewsletterRoute = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Newsletter route working",
  });
});
