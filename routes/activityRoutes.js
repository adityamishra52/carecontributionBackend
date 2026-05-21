import { Router } from "express";
import { createActivity, deleteActivity, getActivities, updateActivity } from "../controllers/activityController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAdmin, upload.array("images", 6), createActivity);
router.get("/", getActivities);
router.put("/:id", requireAdmin, upload.array("images", 6), updateActivity);
router.delete("/:id", requireAdmin, deleteActivity);

export default router;
