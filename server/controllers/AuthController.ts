import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserModel } from "../models/User";
import { ProfileModel } from "../models/Profile";
import { PasswordResetTokenModel } from "../models/PasswordResetToken";
import { EmailService } from "../utils/emailService";
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

  /**
   * Solicita um OTP para recuperação de senha
   */
  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { contact, deliveryMethod } = req.body;

      // Validação dos dados de entrada
      if (!contact || !deliveryMethod) {
        return res.status(400).json({ 
          message: "Contacto e método de entrega são obrigatórios" 
        });
      }

      if (deliveryMethod !== 'email') {
        return res.status(400).json({ 
          message: "Apenas o método de entrega por email está disponível" 
        });
      }

      // Buscar usuário pelo email
      const user = await UserModel.findByEmail(contact);
      if (!user) {
        // Por segurança, não revelamos se o email existe ou não
        return res.json({ 
          message: "Se o email existir, um código de verificação será enviado" 
        });
      }

      // Invalidar tokens anteriores do usuário
      await PasswordResetTokenModel.invalidateUserTokens(user.id);

      // Criar novo token OTP
      const otp = PasswordResetTokenModel.generateOTP();
      const expiresAt = PasswordResetTokenModel.getExpirationTime();
      
      const tokenData = await PasswordResetTokenModel.create({
        userId: user.id,
        email: contact,
        deliveryMethod: 'email',
        token: otp,
        expiresAt: expiresAt
      });

      // Enviar OTP por email
      await EmailService.sendPasswordResetOTP({
        to: contact,
        otp: otp,
        userName: user.fullName
      });

      res.json({ 
        message: "Código de verificação enviado com sucesso",
        tokenId: tokenData.id
      });
    } catch (error) {
      console.error("Request password reset error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Valida o OTP fornecido pelo usuário
   */
  static async validateOTP(req: Request, res: Response) {
    try {
      const { tokenId, otp } = req.body;

      if (!tokenId || !otp) {
        return res.status(400).json({ 
          message: "ID do token e código OTP são obrigatórios" 
        });
      }

      // Buscar token
      const token = await PasswordResetTokenModel.findById(tokenId);
      if (!token) {
        return res.status(400).json({ 
          message: "Token inválido ou expirado" 
        });
      }

      // Verificar se o token não foi usado e não expirou
      if (token.isUsed) {
        return res.status(400).json({ 
          message: "Este código já foi utilizado" 
        });
      }

      if (new Date() > token.expiresAt) {
        return res.status(400).json({ 
          message: "Código expirado. Solicite um novo código" 
        });
      }

      // Verificar se o OTP está correto
      if (token.token !== otp) {
        return res.status(400).json({ 
          message: "Código de verificação inválido" 
        });
      }

      res.json({ 
        message: "Código validado com sucesso",
        valid: true
      });
    } catch (error) {
      console.error("Validate OTP error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Redefine a senha do usuário após validação do OTP
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { tokenId, otp, newPassword } = req.body;

      if (!tokenId || !otp || !newPassword) {
        return res.status(400).json({ 
          message: "Todos os campos são obrigatórios" 
        });
      }

      // Validar força da senha
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: "A senha deve ter pelo menos 6 caracteres" 
        });
      }

      // Buscar token
      const token = await PasswordResetTokenModel.findById(tokenId);
      if (!token) {
        return res.status(400).json({ 
          message: "Token inválido ou expirado" 
        });
      }

      // Verificar se o token não foi usado e não expirou
      if (token.isUsed) {
        return res.status(400).json({ 
          message: "Este código já foi utilizado" 
        });
      }

      if (new Date() > token.expiresAt) {
        return res.status(400).json({ 
          message: "Código expirado. Solicite um novo código" 
        });
      }

      // Verificar se o OTP está correto
      if (token.token !== otp) {
        return res.status(400).json({ 
          message: "Código de verificação inválido" 
        });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha do usuário
      await UserModel.updatePassword(token.userId, hashedPassword);

      // Marcar token como usado
      await PasswordResetTokenModel.markAsUsed(tokenId);

      res.json({ 
        message: "Senha redefinida com sucesso" 
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}