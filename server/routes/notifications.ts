import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

// Notification routes
router.get("/", NotificationController.getByUserId);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);

export default router;