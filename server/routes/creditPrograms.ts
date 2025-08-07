import { Router } from "express";
import { CreditProgramController } from "../controllers/CreditProgramController.js";

const router = Router();

// Middleware to verify JWT token (same as in routes.ts)
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const jwt = await import("jsonwebtoken");
    const { storage } = await import("../storage.js");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    
    const decoded: any = jwt.default.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Public routes (no authentication required)
// Get all public credit programs
router.get("/public", CreditProgramController.getAllPublicPrograms);

// Get credit programs by financial institution
router.get("/institution/:institutionId", CreditProgramController.getProgramsByInstitution);

// All other routes require authentication
router.use(authenticateToken);

// Get all credit programs for the authenticated financial institution
router.get("/", CreditProgramController.getPrograms);

// Get single credit program
router.get("/:id", CreditProgramController.getProgram);

// Create new credit program
router.post("/", CreditProgramController.createProgram);

// Update credit program
router.put("/:id", CreditProgramController.updateProgram);

// Delete credit program
router.delete("/:id", CreditProgramController.deleteProgram);

// Toggle active status
router.patch("/:id/toggle-status", CreditProgramController.toggleActiveStatus);

export default router;