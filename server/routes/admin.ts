import { Router } from "express";
import { CreditApplicationController } from "../controllers/CreditApplicationController";
import { AccountController } from "../controllers/AccountController";
import { UserController } from "../controllers/UserController";
import { ProfileController, PermissionController } from "../controllers/ProfileController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// Middleware to check admin/financial institution access
const checkAdminAccess = (req: any, res: any, next: any) => {
  if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
    return res.status(403).json({ message: "Acesso negado" });
  }
  next();
};

router.use(checkAdminAccess);

// Application management routes
router.get("/credit-applications", CreditApplicationController.getForFinancialInstitution);
router.patch("/credit-applications/:id/status", CreditApplicationController.updateStatus);

// Account management routes
router.get("/accounts", AccountController.getByFinancialInstitution);

// User management routes (admin only)
router.get("/users", UserController.getAll);
router.post("/users", UserController.create);
router.patch("/users/:id", UserController.update);
router.patch("/users/:id/profile", UserController.assignProfile);

// Profile management routes (admin only)
router.get("/profiles", ProfileController.getAll);
router.get("/profiles/:id", ProfileController.getById);
router.post("/profiles", ProfileController.create);
router.patch("/profiles/:id", ProfileController.update);
router.delete("/profiles/:id", ProfileController.delete);
router.get("/profiles/:id/permissions", ProfileController.getPermissions);
router.post("/profiles/:id/permissions", ProfileController.addPermission);
router.delete("/profiles/:id/permissions/:permissionId", ProfileController.removePermission);

// Permission management routes (admin only)
router.get("/permissions", PermissionController.getAll);

// Statistics endpoint
router.get("/stats", async (req: any, res) => {
  try {
    const { CreditApplicationModel } = await import("../models/CreditApplication");
    const applications = await CreditApplicationModel.findAll();
    
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === "pending").length,
      approved: applications.filter(app => app.status === "approved").length,
      rejected: applications.filter(app => app.status === "rejected").length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;