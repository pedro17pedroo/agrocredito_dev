import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All account routes require authentication
router.use(authenticateToken);

// Account routes
router.get("/", AccountController.getAll);
router.get("/user", AccountController.getByUserId);
router.get("/financial-institution", AccountController.getByFinancialInstitution);
router.get("/:id", AccountController.getById);

// Payment routes
router.post("/:accountId/payments", AccountController.createPayment);
router.get("/:accountId/payments", AccountController.getPayments);

export default router;