import { Router } from "express";
import {
  createReport,
  deleteReport,
  getReports,
  getSiteSetting,
  getSiteSettingQrImage,
  saveSiteSetting,
  updateReport,
} from "../controllers/transparencyController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadMemory } from "../middleware/memoryUploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/reports", requireAdmin, upload.single("image"), createReport);
router.get("/reports", getReports);
router.put("/reports/:id", requireAdmin, upload.single("image"), updateReport);
router.delete("/reports/:id", requireAdmin, deleteReport);
router.get("/settings/qr-image", getSiteSettingQrImage);
router.get("/settings", getSiteSetting);
router.put("/settings", requireAdmin, uploadMemory.single("qrImage"), saveSiteSetting);

export default router;
