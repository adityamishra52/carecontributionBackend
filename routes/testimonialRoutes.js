import { Router } from "express";
import { createTestimonial, deleteTestimonial, getTestimonialAvatar, getTestimonials, updateTestimonial } from "../controllers/testimonialController.js";
import { uploadMemory } from "../middleware/memoryUploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAdmin, uploadMemory.single("avatar"), createTestimonial);
router.get("/", getTestimonials);
router.get("/:id/avatar", getTestimonialAvatar);
router.put("/:id", requireAdmin, uploadMemory.single("avatar"), updateTestimonial);
router.delete("/:id", requireAdmin, deleteTestimonial);

export default router;
