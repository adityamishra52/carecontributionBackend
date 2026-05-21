import { Router } from "express";
import { createFAQ, deleteFAQ, getFAQs, updateFAQ } from "../controllers/faqController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAdmin, createFAQ);
router.get("/", getFAQs);
router.put("/:id", requireAdmin, updateFAQ);
router.delete("/:id", requireAdmin, deleteFAQ);

export default router;
