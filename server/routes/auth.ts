import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Password reset routes
router.post("/request-password-reset", AuthController.requestPasswordReset);
router.post("/validate-otp", AuthController.validateOTP);
router.post("/reset-password", AuthController.resetPassword);

// Protected routes
router.get("/me", authenticateToken, AuthController.getMe);
router.get("/permissions", authenticateToken, AuthController.getUserPermissions);

export default router;