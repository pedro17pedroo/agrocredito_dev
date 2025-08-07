import { Express, Router } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { CreditProgramController } from "../controllers/CreditProgramController";

// Import route modules
import authRoutes from "./auth";
import creditApplicationRoutes from "./creditApplications";
import accountRoutes from "./accounts";
import notificationRoutes from "./notifications";
import userRoutes from "./users";
import profileRoutes from "./profiles";
import adminRoutes from "./admin";
import financialUserRoutes from "./financialUsers";

export function registerRoutes(app: Express): Server {
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

  // Credit Programs Routes
  const creditProgramRouter = Router();
  // Public routes first (no authentication required)
  creditProgramRouter.get("/public", CreditProgramController.getAllPublicPrograms);
  creditProgramRouter.get("/institution/:institutionId", CreditProgramController.getProgramsByInstitution);
  
  // Protected routes (authentication required)
  creditProgramRouter.use(authenticateToken);
  creditProgramRouter.get("/", CreditProgramController.getPrograms);
  creditProgramRouter.get("/:id", CreditProgramController.getProgram);
  creditProgramRouter.post("/", CreditProgramController.createProgram);
  creditProgramRouter.put("/:id", CreditProgramController.updateProgram);
  creditProgramRouter.delete("/:id", CreditProgramController.deleteProgram);
  creditProgramRouter.patch("/:id/toggle-status", CreditProgramController.toggleActiveStatus);

  // Register all API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/credit-applications", creditApplicationRoutes);
  app.use("/api/credit-programs", creditProgramRouter);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/profiles", profileRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/financial-users", financialUserRoutes);

  // Add credit simulator as a public route
  app.post("/api/simulate-credit", async (req, res) => {
    const { amount, term, projectType, monthlyIncome, creditProgramId } = req.body;

    if (!amount || !term || !monthlyIncome) {
      return res.status(400).json({ message: "Amount, term, and monthly income are required" });
    }

    let interestRate = 15; // Default base rate
    let effortRate = 30; // Default effort rate percentage

    try {
      // If a specific credit program is selected, use its interest rate and effort rate
      if (creditProgramId) {
        const { db } = await import("../db.js");
        const { creditPrograms } = await import("../../shared/schema.js");
        const { eq } = await import("drizzle-orm");
        
        const program = await db
          .select()
          .from(creditPrograms)
          .where(eq(creditPrograms.id, creditProgramId))
          .limit(1);

        if (program.length > 0) {
          interestRate = parseFloat(program[0].interestRate);
          effortRate = parseFloat(program[0].effortRate);
        }
      } else {
        // Fallback: Base interest rate calculation based on project type
        const rateAdjustments: { [key: string]: number } = {
          cattle: -2,
          corn: -1, 
          cassava: 0,
          horticulture: 1,
          poultry: 2,
          other: 3,
        };
        interestRate = 15 + (rateAdjustments[projectType] || 0);
      }

      // Calculate monthly payment based on interest rate
      const monthlyRate = interestRate / 100 / 12;
      const calculatedMonthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                                      (Math.pow(1 + monthlyRate, term) - 1);

      // Apply effort rate constraint
      const maxMonthlyPayment = (monthlyIncome * effortRate) / 100;
      const isEffortRateViolated = calculatedMonthlyPayment > maxMonthlyPayment;
      
      // Final monthly payment (respecting effort rate)
      const monthlyPayment = Math.min(calculatedMonthlyPayment, maxMonthlyPayment);
      
      const totalAmount = monthlyPayment * term;
      const totalInterest = totalAmount - amount;
      const effortRatePercentage = (monthlyPayment / monthlyIncome) * 100;

      res.json({
        amount: parseFloat(amount),
        term: parseInt(term),
        monthlyIncome: parseFloat(monthlyIncome),
        interestRate: parseFloat(interestRate.toFixed(2)),
        effortRate: parseFloat(effortRate.toFixed(2)),
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        effortRatePercentage: Math.round(effortRatePercentage * 100) / 100,
        isEffortRateViolated: isEffortRateViolated,
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
        creditProgramId: creditProgramId || null,
      });
    } catch (error) {
      console.error("Error in credit simulation:", error);
      res.status(500).json({ message: "Error calculating simulation" });
    }
  });

  return createServer(app);
}