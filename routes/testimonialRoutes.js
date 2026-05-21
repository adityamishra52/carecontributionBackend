import { Router } from "express";
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from "../controllers/testimonialController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAdmin, upload.single("avatar"), createTestimonial);
router.get("/", getTestimonials);
router.put("/:id", requireAdmin, upload.single("avatar"), updateTestimonial);
router.delete("/:id", requireAdmin, deleteTestimonial);

export default router;
