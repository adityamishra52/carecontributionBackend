import { Router } from "express";
import {
  deleteGalleryImage,
  getGalleryImageById,
  getGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from "../controllers/galleryController.js";
import { uploadMemory } from "../middleware/memoryUploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getGalleryImages);
router.get("/:id/image", getGalleryImageById);

// Admin protected routes
router.post("/", requireAdmin, uploadMemory.single("image"), uploadGalleryImage);
router.put("/:id", requireAdmin, uploadMemory.single("image"), updateGalleryImage);
router.delete("/:id", requireAdmin, deleteGalleryImage);

export default router;