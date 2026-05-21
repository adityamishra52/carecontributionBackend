import { asyncHandler } from "../middleware/asyncHandler.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { TransparencyReport } from "../models/TransparencyReport.js";

const publicSettingFields =
  "upiId qrImageUrl qrImageMimeType qrImageFilename qrImageSize paymentInstructions disclaimer createdAt updatedAt";

const settingsQrImageUrl = "/api/transparency/settings/qr-image";

function toPublicSiteSetting(setting) {
  if (!setting) return null;

  const value =
    typeof setting.toObject === "function" ? setting.toObject() : setting;
  const { qrImageData, ...publicSetting } = value;

  return publicSetting;
}

export const createReport = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.imageUrl = `/uploads/${req.file.filename}`;
  }
  const report = await TransparencyReport.create(payload);
  res.status(201).json(report);
});

export const getReports = asyncHandler(async (req, res) => {
  try {
    const reports = await TransparencyReport.find().sort({ createdAt: -1 });
    res.json(Array.isArray(reports) ? reports : []);
  } catch {
    res.json([]);
  }
});

export const deleteReport = asyncHandler(async (req, res) => {
  const deleted = await TransparencyReport.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("report not found");
  }
  res.json({ message: "report deleted" });
});

export const updateReport = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file) {
    payload.imageUrl = `/uploads/${req.file.filename}`;
  }

  if (payload.totalSupportReceived !== undefined) {
    payload.totalSupportReceived = Number(payload.totalSupportReceived || 0);
  }

  if (payload.totalSupportUsed !== undefined) {
    payload.totalSupportUsed = Number(payload.totalSupportUsed || 0);
  }

  const updated = await TransparencyReport.findByIdAndUpdate(
    req.params.id,
    payload,
    { new: true, runValidators: true }
  );

  if (!updated) {
    res.status(404);
    throw new Error("report not found");
  }

  res.json(updated);
});

export const saveSiteSetting = asyncHandler(async (req, res) => {
  const payload = {};

  if (typeof req.body.upiId === "string") {
    payload.upiId = req.body.upiId.trim();
  }

  if (typeof req.body.paymentInstructions === "string") {
    payload.paymentInstructions = req.body.paymentInstructions.trim();
  }

  if (typeof req.body.disclaimer === "string") {
    payload.disclaimer = req.body.disclaimer.trim();
  }

  if (typeof req.body.qrImageUrl === "string" && req.body.qrImageUrl.trim()) {
    payload.qrImageUrl = req.body.qrImageUrl.trim();
  }

  if (req.file) {
    payload.qrImageUrl = settingsQrImageUrl;
    payload.qrImageData = req.file.buffer;
    payload.qrImageMimeType = req.file.mimetype;
    payload.qrImageFilename = req.file.originalname;
    payload.qrImageSize = req.file.size;
  }

  const current = await SiteSetting.findOne();

  if (!current) {
    const created = await SiteSetting.create(payload);
    const saved = await SiteSetting.findById(created._id).select(
      publicSettingFields
    );
    res.status(201).json(toPublicSiteSetting(saved));
    return;
  }

  Object.assign(current, payload);
  await current.save();

  const saved = await SiteSetting.findById(current._id).select(
    publicSettingFields
  );

  res.json(toPublicSiteSetting(saved));
});

export const getSiteSetting = asyncHandler(async (req, res) => {
  const fallback = {
    upiId: process.env.UPI_ID || "carecontribution@upi",
    qrImageUrl: undefined,
    paymentInstructions: undefined,
    disclaimer: "This is a personal community support initiative, not a registered NGO.",
  };

  try {
    const setting = await SiteSetting.findOne().select(publicSettingFields);
    if (setting) {
      res.json(toPublicSiteSetting(setting));
      return;
    }
  } catch {
    res.json(fallback);
    return;
  }

  res.json({
    ...fallback,
  });
});

export const getSiteSettingQrImage = asyncHandler(async (req, res) => {
  const setting = await SiteSetting.findOne().select(
    "+qrImageData qrImageMimeType updatedAt"
  );

  if (!setting || !setting.qrImageData?.length) {
    return res.status(404).json({
      success: false,
      message: "QR image not found",
      data: null,
    });
  }

  res.set("Cache-Control", "no-store");
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Content-Length", setting.qrImageData.length);
  res.contentType(setting.qrImageMimeType || "application/octet-stream");

  return res.send(setting.qrImageData);
});
