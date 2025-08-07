import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserModel } from "../models/User";
import { ProfileModel } from "../models/Profile";
import { insertUserSchema } from "@shared/schema";

// Extended schema for creating internal users
const createInternalUserSchema = insertUserSchema.extend({
  parentInstitutionId: z.string().optional(),
});

export class FinancialUserController {
  // Get all internal users for the authenticated financial institution
  static async getInternalUsers(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Determine the institution ID - could be user's own ID or parent institution
      let institutionId = user.id;
      if (user.parentInstitutionId) {
        institutionId = user.parentInstitutionId;
      }

      // Get all users that belong to this financial institution
      const internalUsers = await UserModel.findByParentInstitution(institutionId);
      
      // Remove passwords from response
      const sanitizedUsers = internalUsers.map(user => ({
        ...user,
        password: undefined,
      }));
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Get internal users error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Get all clients (farmers, companies, cooperatives) for this financial institution
  static async getClients(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Get all farmer, company and cooperative users
      const clients = await UserModel.findClients();
      
      // Remove passwords from response
      const sanitizedClients = clients.map(client => ({
        ...client,
        password: undefined,
      }));
      
      res.json(sanitizedClients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Create internal user for financial institution
  static async createInternalUser(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const userData = createInternalUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await UserModel.findByPhone(userData.phone);
      if (existingUser) {
        return res.status(400).json({ message: "Utilizador já existe com este telefone" });
      }

      if (userData.email) {
        const existingEmailUser = await UserModel.findByEmail(userData.email);
        if (existingEmailUser) {
          return res.status(400).json({ message: "Utilizador já existe com este email" });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // If no profile specified, assign "Instituição Financeira" profile automatically
      let profileId = userData.profileId;
      if (!profileId || profileId === "" || profileId === "none") {
        const financialInstitutionProfile = await ProfileModel.findByName("Instituição Financeira");
        if (financialInstitutionProfile) {
          profileId = financialInstitutionProfile.id;
        }
      }
      
      // Create internal user linked to this financial institution
      const newUser = await UserModel.create({
        ...userData,
        password: hashedPassword,
        profileId,
        parentInstitutionId: user.id, // Link to parent financial institution
      });

      // Remove password from response
      const { password, ...sanitizedUser } = newUser;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("Create internal user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Update internal user
  static async updateInternalUser(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Check if the user to be updated belongs to this institution
      const targetUser = await UserModel.findById(id);
      if (!targetUser || targetUser.parentInstitutionId !== user.id) {
        return res.status(404).json({ message: "Utilizador não encontrado ou não pertence à sua instituição" });
      }

      const updateData = req.body;

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await UserModel.update(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      // Remove password from response
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Update internal user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Deactivate internal user
  static async deactivateInternalUser(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Check if the user to be deactivated belongs to this institution
      const targetUser = await UserModel.findById(id);
      if (!targetUser || targetUser.parentInstitutionId !== user.id) {
        return res.status(404).json({ message: "Utilizador não encontrado ou não pertence à sua instituição" });
      }

      const updatedUser = await UserModel.update(id, { isActive: false });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      // Remove password from response
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Assign profile to internal user
  static async assignProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { profileId } = req.body;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Check if the user belongs to this institution
      const targetUser = await UserModel.findById(id);
      if (!targetUser || targetUser.parentInstitutionId !== user.id) {
        return res.status(404).json({ message: "Utilizador não encontrado ou não pertence à sua instituição" });
      }

      // Check if profile exists
      const profile = await ProfileModel.findById(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }

      const updatedUser = await UserModel.assignProfile(id, profileId);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      // Remove password from response
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Assign profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Get available profiles for assignment
  static async getAvailableProfiles(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user || user.userType !== "financial_institution") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const profiles = await ProfileModel.findAll();
      res.json(profiles);
    } catch (error) {
      console.error("Get profiles error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}