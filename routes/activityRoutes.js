import { Router } from "express";
import { createActivity, deleteActivity, getActivities, getActivityImage, updateActivity } from "../controllers/activityController.js";
import { uploadMemory } from "../middleware/memoryUploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAdmin, uploadMemory.array("images", 6), createActivity);
router.get("/", getActivities);
router.get("/:id/images/:index", getActivityImage);
router.put("/:id", requireAdmin, uploadMemory.array("images", 6), updateActivity);
router.delete("/:id", requireAdmin, deleteActivity);

export default router;
