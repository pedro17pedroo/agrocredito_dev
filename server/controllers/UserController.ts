import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserModel } from "../models/User";
import { ProfileModel } from "../models/Profile";
import { insertUserSchema } from "@shared/schema";

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      // Remove passwords from response
      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined,
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Get all financial institutions (public endpoint for farmers/companies)
  static async getFinancialInstitutions(req: Request, res: Response) {
    try {
      const institutions = await UserModel.findFinancialInstitutions();
      // Remove passwords and sensitive data from response
      const sanitizedInstitutions = institutions.map(institution => ({
        id: institution.id,
        fullName: institution.fullName,
        userType: institution.userType,
        isActive: institution.isActive,
      }));
      res.json(sanitizedInstitutions);
    } catch (error) {
      console.error("Get financial institutions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      // Remove password from response
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await UserModel.findByPhone(userData.phone) || 
                          (userData.email ? await UserModel.findByEmail(userData.email) : null);
      
      if (existingUser) {
        return res.status(400).json({ message: "Utilizador já existe com este telefone ou email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("Create user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const user = await UserModel.update(id, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      // Remove password from response
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async assignProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { profileId } = req.body;

      if (!profileId) {
        return res.status(400).json({ message: "ID do perfil é obrigatório" });
      }

      // Verify profile exists
      const profile = await ProfileModel.findById(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }

      await UserModel.assignProfile(id, profileId);
      res.json({ message: "Perfil atribuído com sucesso" });
    } catch (error) {
      console.error("Assign profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}