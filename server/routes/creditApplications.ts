import { Router } from "express";
import { CreditApplicationController } from "../controllers/CreditApplicationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All credit application routes require authentication
router.use(authenticateToken);

// Application routes
router.post("/", CreditApplicationController.create);
router.get("/", CreditApplicationController.getAll);
router.get("/user", CreditApplicationController.getByUserId);
router.get("/financial-institution", CreditApplicationController.getForFinancialInstitution);
router.get("/:id", CreditApplicationController.getById);
router.patch("/:id/status", CreditApplicationController.updateStatus);

// Credit simulator
router.post("/simulate", CreditApplicationController.simulate);

export default router;