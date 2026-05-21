import { Router } from "express";
import { subscribeToNewsletter, testNewsletterRoute } from "../controllers/newsletterController.js";

const router = Router();

router.get("/test", testNewsletterRoute);
router.post("/subscribe", subscribeToNewsletter);

export default router;
