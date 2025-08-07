import { Router } from "express";
import jwt from "jsonwebtoken";
import { FinancialUserController } from "../controllers/FinancialUserController";

const router = Router();

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Import storage here to avoid circular dependencies
    const { storage } = await import("../storage");
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

// All routes require authentication
router.use(authenticateToken);

// Internal team management
router.get("/internal", FinancialUserController.getInternalUsers);
router.post("/internal", FinancialUserController.createInternalUser);
router.patch("/internal/:id", FinancialUserController.updateInternalUser);
router.patch("/internal/:id/deactivate", FinancialUserController.deactivateInternalUser);
router.patch("/internal/:id/profile", FinancialUserController.assignProfile);

// Client management
router.get("/clients", FinancialUserController.getClients);

// Profile management
router.get("/profiles", FinancialUserController.getAvailableProfiles);

export default router;