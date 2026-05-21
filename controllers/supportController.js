import { asyncHandler } from "../middleware/asyncHandler.js";
import { SupportMessage } from "../models/SupportMessage.js";

export const submitSupportMessage = asyncHandler(async (req, res) => {
  const { contributorName, supportMessage, amount, anonymous, upiId, name, message } = req.body;
  const finalMessage = supportMessage || message;
  const isLeaderboardRequest = req.baseUrl?.endsWith("/supporters");

  if (!finalMessage || !String(finalMessage).trim()) {
    res.status(400);
    throw new Error("supportMessage is required");
  }

  const parsedAmount = Number(amount || 0);
  if (amount !== undefined && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
    res.status(400);
    throw new Error("amount must be a valid number");
  }

  const payload = await SupportMessage.create({
    contributorName: contributorName || name,
    supportMessage: finalMessage,
    amount: parsedAmount,
    anonymous: anonymous === true || anonymous === "true",
    upiId,
    isLeaderboardEntry: isLeaderboardRequest,
  });
  res.status(201).json(payload);
});

export const getSupportMessages = asyncHandler(async (req, res) => {
  try {
    const query = req.baseUrl?.endsWith("/supporters")
      ? { isLeaderboardEntry: true }
      : {};
    const data = await SupportMessage.find(query).sort({ createdAt: -1 });
    res.json(Array.isArray(data) ? data : []);
  } catch {
    res.json([]);
  }
});

export const updateSupportMessage = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.message && !payload.supportMessage) {
    payload.supportMessage = payload.message;
  }
  if (payload.name && !payload.contributorName) {
    payload.contributorName = payload.name;
  }
  if (payload.amount !== undefined) {
    const parsedAmount = Number(payload.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      res.status(400);
      throw new Error("amount must be a valid number");
    }
    payload.amount = parsedAmount;
  }
  payload.isLeaderboardEntry = true;

  const updated = await SupportMessage.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!updated) {
    res.status(404);
    throw new Error("support entry not found");
  }
  res.json(updated);
});

export const deleteSupportMessage = asyncHandler(async (req, res) => {
  const deleted = await SupportMessage.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("support entry not found");
  }
  res.json({ message: "support entry deleted" });
});
