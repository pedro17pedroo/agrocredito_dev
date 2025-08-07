import { Router } from "express";
import { ProfileController, PermissionController } from "../controllers/ProfileController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile routes
router.get("/", ProfileController.getAll);
router.get("/:id", ProfileController.getById);
router.post("/", ProfileController.create);
router.patch("/:id", ProfileController.update);
router.delete("/:id", ProfileController.delete);

// Profile permission routes
router.get("/:id/permissions", ProfileController.getPermissions);
router.post("/:id/permissions", ProfileController.addPermission);
router.delete("/:id/permissions/:permissionId", ProfileController.removePermission);

// Permission routes
router.get("/permissions/all", PermissionController.getAll);

export default router;