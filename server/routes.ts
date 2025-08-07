import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
  insertUserSchema, 
  insertCreditApplicationSchema, 
  insertProfileSchema,
  insertAccountSchema,
  insertPaymentSchema,
  insertNotificationSchema 
} from "@shared/schema";
import { z } from "zod";

// JWT secret - in production this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Import and register credit program routes
  const creditProgramRoutes = await import("./routes/creditPrograms.js");
  app.use("/api/credit-programs", creditProgramRoutes.default);
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phone) || 
                          (userData.email ? await storage.getUserByEmail(userData.email) : null);
      
      if (existingUser) {
        return res.status(400).json({ message: "Utilizador já existe com este telefone ou email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { loginIdentifier, password } = req.body;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ message: "Email/telefone e palavra-passe são obrigatórios" });
      }

      // Find user by email or phone
      let user = null;
      if (loginIdentifier.includes("@")) {
        user = await storage.getUserByEmail(loginIdentifier);
      } else {
        user = await storage.getUserByPhone(loginIdentifier);
      }

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      id: req.user.id,
      fullName: req.user.fullName,
      phone: req.user.phone,
      email: req.user.email,
      userType: req.user.userType,
    });
  });

  // Credit application routes
  app.post("/api/credit-applications", authenticateToken, async (req: any, res) => {
    try {
      const applicationData = insertCreditApplicationSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const application = await storage.createCreditApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Credit application error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/credit-applications", authenticateToken, async (req: any, res) => {
    try {
      const applications = await storage.getCreditApplicationsByUserId(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/credit-applications/:id", authenticateToken, async (req: any, res) => {
    try {
      const application = await storage.getCreditApplicationById(req.params.id);
      if (!application || application.userId !== req.user.id) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }
      res.json(application);
    } catch (error) {
      console.error("Get application error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Account routes
  app.get("/api/accounts", authenticateToken, async (req: any, res) => {
    try {
      const accounts = await storage.getAccountsByUserId(req.user.id);
      res.json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Admin routes for financial institutions
  app.get("/api/admin/credit-applications", authenticateToken, async (req: any, res) => {
    try {
      // Verificar se o usuário é admin ou instituição financeira
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      if (req.user.userType === "admin") {
        // Admin can see all applications
        const applications = await storage.getAllCreditApplications();
        res.json(applications);
      } else {
        // Financial institutions see applications specific to them
        const applications = await storage.getCreditApplicationsForFinancialInstitution(req.user.id);
        res.json(applications);
      }
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.patch("/api/admin/credit-applications/:id/status", authenticateToken, async (req: any, res) => {
    try {
      // Verificar se o usuário é admin ou instituição financeira
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!["pending", "under_review", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Estado inválido" });
      }

      await storage.updateCreditApplicationStatus(id, status, rejectionReason, req.user.id);
      
      // Se aprovado, criar conta automaticamente
      if (status === "approved") {
        const application = await storage.getCreditApplicationById(id);
        if (application) {
          // Calcular taxa de juros baseada no tipo de projeto
          let baseRate = 15;
          const rateAdjustments: { [key: string]: number } = {
            cattle: -2, corn: -1, cassava: 0, horticulture: 1, poultry: 2, other: 3,
          };
          const interestRate = baseRate + (rateAdjustments[application.projectType] || 0);
          
          // Calcular pagamento mensal
          const monthlyRate = interestRate / 100 / 12;
          const numPayments = application.term;
          const principal = parseFloat(application.amount);
          
          const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                               (Math.pow(1 + monthlyRate, numPayments) - 1);
          
          const totalAmount = monthlyPayment * numPayments;
          
          // Calcular próxima data de pagamento (30 dias a partir de hoje)
          const nextPaymentDate = new Date();
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

          await storage.createAccount({
            applicationId: application.id,
            userId: application.userId,
            financialInstitutionId: req.user.id, // The financial institution that approved this application
            totalAmount: totalAmount.toString(),
            outstandingBalance: totalAmount.toString(),
            monthlyPayment: monthlyPayment.toString(),
            nextPaymentDate,
          });

          // Criar notificação de aprovação
          await storage.createNotification({
            userId: application.userId,
            type: "application_approved",
            title: "Solicitação Aprovada!",
            message: `A sua solicitação de crédito para "${application.projectName}" foi aprovada. Uma conta foi criada automaticamente.`,
            relatedId: application.id,
          });
        }
      } else if (status === "rejected") {
        // Criar notificação de rejeição
        const application = await storage.getCreditApplicationById(id);
        if (application) {
          await storage.createNotification({
            userId: application.userId,
            type: "application_rejected",
            title: "Solicitação Rejeitada",
            message: `A sua solicitação de crédito para "${application.projectName}" foi rejeitada. ${rejectionReason || ""}`,
            relatedId: application.id,
          });
        }
      }

      res.json({ message: "Estado atualizado com sucesso" });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/admin/stats", authenticateToken, async (req: any, res) => {
    try {
      // Verificar se o usuário é admin ou instituição financeira
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const applications = await storage.getAllCreditApplications();
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

  // Credit simulation endpoint
  app.post("/api/simulate-credit", async (req, res) => {
    try {
      const { amount, term, projectType } = req.body;
      console.log("Simulation request:", { amount, term, projectType });

      if (!amount || !term) {
        return res.status(400).json({ message: "Montante e prazo são obrigatórios" });
      }

      // Simple interest rate calculation based on project type and term
      let baseRate = 15; // 15% base rate
      
      // Adjust rate based on project type (some projects are riskier)
      const rateAdjustments: { [key: string]: number } = {
        cattle: -2, // Lower risk
        corn: -1,
        cassava: 0,
        horticulture: 1,
        poultry: 2,
        other: 3, // Higher risk
      };

      const interestRate = baseRate + (rateAdjustments[projectType] || 0);
      
      // Calculate monthly payment using compound interest formula
      const monthlyRate = interestRate / 100 / 12;
      const numPayments = parseInt(term);
      const principal = parseFloat(amount);
      
      console.log("Calculation inputs:", { principal, monthlyRate, numPayments, interestRate });
      
      // Handle edge case where monthlyRate is 0 (would cause NaN)
      let monthlyPayment;
      if (monthlyRate === 0) {
        monthlyPayment = principal / numPayments;
      } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
      }
      
      const totalAmount = monthlyPayment * numPayments;
      const totalInterest = totalAmount - principal;

      console.log("Calculation results:", { monthlyPayment, totalAmount, totalInterest });

      res.json({
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(totalAmount),
        interestRate,
        totalInterest: Math.round(totalInterest),
      });
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notificação marcada como lida" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.patch("/api/notifications/mark-all-read", authenticateToken, async (req: any, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: "Todas as notificações marcadas como lidas" });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Account payment routes
  app.post("/api/accounts/:id/payments", authenticateToken, async (req: any, res) => {
    try {
      const { amount, paymentDate } = req.body;
      const accountId = req.params.id;

      // Verificar se a conta pertence ao usuário
      const account = await storage.getAccountById(accountId);
      if (!account || account.userId !== req.user.id) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      // Criar o pagamento
      const payment = await storage.createPayment({
        accountId,
        amount: amount.toString(),
        paymentDate: new Date(paymentDate),
      });

      // Atualizar o saldo da conta
      const newBalance = parseFloat(account.outstandingBalance) - parseFloat(amount);
      
      // Calcular próxima data de pagamento (30 dias a partir de hoje)
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

      await storage.updateAccountBalance(accountId, Math.max(0, newBalance), nextPaymentDate);

      // Criar notificação de confirmação de pagamento
      await storage.createNotification({
        userId: req.user.id,
        type: "payment_confirmed",
        title: "Pagamento Confirmado",
        message: `Pagamento de ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(parseFloat(amount))} foi processado com sucesso.`,
        relatedId: accountId,
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/accounts/:id/payments", authenticateToken, async (req: any, res) => {
    try {
      const accountId = req.params.id;

      // Verificar se a conta pertence ao usuário
      const account = await storage.getAccountById(accountId);
      if (!account || account.userId !== req.user.id) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      const payments = await storage.getPaymentsByAccountId(accountId);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Reports endpoint to get all payments for the user
  app.get("/api/reports/payments", authenticateToken, async (req: any, res) => {
    try {
      // Get all accounts for the user
      const accounts = await storage.getAccountsByUserId(req.user.id);
      const allPayments = [];
      
      // Get payments for each account
      for (const account of accounts) {
        const payments = await storage.getPaymentsByAccountId(account.id);
        allPayments.push(...payments);
      }
      
      res.json(allPayments);
    } catch (error) {
      console.error("Get reports payments error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Profile management routes
  app.get("/api/profiles", authenticateToken, async (req: any, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Get profiles error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/profiles", authenticateToken, async (req: any, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/profiles/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await storage.updateProfile(id, updateData);
      res.json({ message: "Perfil actualizado com sucesso" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/profiles/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProfile(id);
      res.json({ message: "Perfil eliminado com sucesso" });
    } catch (error) {
      console.error("Delete profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Permission management routes
  app.get("/api/permissions", authenticateToken, async (req: any, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Get permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/profiles/:id/permissions", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const permissions = await storage.getProfilePermissions(id);
      res.json(permissions);
    } catch (error) {
      console.error("Get profile permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/profiles/:id/permissions", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;
      await storage.addPermissionToProfile(id, permissionId);
      res.json({ message: "Permissão adicionada ao perfil" });
    } catch (error) {
      console.error("Add permission to profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/profiles/:id/permissions/:permissionId", authenticateToken, async (req: any, res) => {
    try {
      const { id, permissionId } = req.params;
      await storage.removePermissionFromProfile(id, permissionId);
      res.json({ message: "Permissão removida do perfil" });
    } catch (error) {
      console.error("Remove permission from profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User profile assignment
  app.put("/api/users/:id/profile", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { profileId } = req.body;
      await storage.assignProfileToUser(id, profileId);
      res.json({ message: "Perfil atribuído ao utilizador" });
    } catch (error) {
      console.error("Assign profile to user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get user permissions
  app.get("/api/users/me/permissions", authenticateToken, async (req: any, res) => {
    try {
      const permissions = await storage.getUserPermissions(req.user.id);
      res.json(permissions);
    } catch (error) {
      console.error("Get user permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get all users (admin and financial institutions)
  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      // Get all users without password using storage
      const allUsers = await storage.getAllUsers();
      
      res.json(allUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create user (admin only)
  app.post("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phone) || 
                          (userData.email ? await storage.getUserByEmail(userData.email) : null);
      
      if (existingUser) {
        return res.status(400).json({ message: "Utilizador já existe com este telefone ou email" });
      }

      // Hash password with default password
      const defaultPassword = "123456"; // Default password for admin-created users
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Utilizador criado com sucesso",
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          userType: user.userType,
        },
        defaultPassword: defaultPassword // Send back so admin can inform user
      });
    } catch (error) {
      console.error("Create user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get all profiles (admin and financial institutions)
  app.get("/api/admin/profiles", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Get profiles error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get all permissions (admin and financial institutions)
  app.get("/api/admin/permissions", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Get permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get all accounts (admin and financial institutions)
  app.get("/api/admin/accounts", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== "admin" && req.user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      if (req.user.userType === "admin") {
        // Admin can see all accounts
        const accounts = await storage.getAllAccounts();
        res.json(accounts);
      } else {
        // Financial institutions see only accounts they manage
        const accounts = await storage.getAccountsByFinancialInstitution(req.user.id);
        res.json(accounts);
      }
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get user permissions
  app.get("/api/user/permissions", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Get user's profile
      const userData = await storage.getUserById(userId);
      
      if (!userData || !userData.profileId) {
        return res.json([]);
      }
      
      // Get permissions for the user's profile
      const userPermissions = await storage.getProfilePermissions(userData.profileId);
      
      res.json(userPermissions);
    } catch (error) {
      console.error("Get user permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
