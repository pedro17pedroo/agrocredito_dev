import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserModel } from "../models/User";
import { ProfileModel } from "../models/Profile";
import { insertUserSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Mapeamento entre userType e nome do perfil
const getUserProfileName = (userType: string): string => {
  const profileMap: { [key: string]: string } = {
    'farmer': 'Agricultor',
    'company': 'Empresa Agrícola',
    'cooperative': 'Cooperativa',
    'financial_institution': 'Instituição Financeira',
    'admin': 'Administrador'
  };
  return profileMap[userType] || 'Agricultor'; // Default para Agricultor
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = (userData.phone ? await UserModel.findByPhone(userData.phone) : null) ||
                          (userData.email ? await UserModel.findByEmail(userData.email) : null) ||
                          (userData.bi ? await UserModel.findByBI(userData.bi) : null);
      
      if (existingUser) {
        return res.status(400).json({ message: "Utilizador já existe com este telefone, email ou BI" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Find the appropriate profile based on userType
      const profileName = getUserProfileName(userData.userType);
      const profile = await ProfileModel.findByName(profileName);
      if (!profile) {
        return res.status(400).json({ message: `Perfil '${profileName}' não encontrado para o tipo de utilizador '${userData.userType}'` });
      }

      // Create user
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
        profileId: profile.id,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, userType: user.userType }, JWT_SECRET, { expiresIn: '7d' });

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
  }

  static async login(req: Request, res: Response) {
    try {
      const { loginIdentifier, password } = req.body;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ message: "Email/telefone e palavra-passe são obrigatórios" });
      }

      // Find user by email or phone
      let user = null;
      if (loginIdentifier.includes("@")) {
        user = await UserModel.findByEmail(loginIdentifier);
      } else {
        user = await UserModel.findByPhone(loginIdentifier);
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
      const token = jwt.sign({ userId: user.id, userType: user.userType }, JWT_SECRET, { expiresIn: '7d' });

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
  }

  static async getMe(req: any, res: Response) {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        bi: user.bi,
        nif: user.nif,
        isActive: user.isActive,
        profileId: user.profileId,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getUserPermissions(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const permissions = await ProfileModel.getUserPermissions(userId);
      
      res.json({
        permissions: permissions.map(p => p.name),
      });
    } catch (error) {
      console.error("Get user permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}