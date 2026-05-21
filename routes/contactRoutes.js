import { Router } from "express";
import {
  deleteContactMessage,
  getContactMessages,
  markContactMessageRead,
  submitContactMessage,
} from "../controllers/contactController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public route
router.post("/", submitContactMessage);

// Admin protected routes
router.get("/", requireAdmin, getContactMessages);
router.patch("/:id/read", requireAdmin, markContactMessageRead);
router.delete("/:id", requireAdmin, deleteContactMessage);

export default router;