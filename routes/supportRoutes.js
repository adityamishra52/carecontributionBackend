import { Router } from "express";
import { deleteSupportMessage, getSupportMessages, submitSupportMessage, updateSupportMessage } from "../controllers/supportController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

const requireAdminForLeaderboard = (req, res, next) => {
  if (req.baseUrl?.endsWith("/supporters")) {
    return requireAdmin(req, res, next);
  }
  return next();
};

router.post("/", requireAdminForLeaderboard, submitSupportMessage);
router.get("/", getSupportMessages);
router.put("/:id", requireAdmin, updateSupportMessage);
router.delete("/:id", requireAdmin, deleteSupportMessage);

export default router;
