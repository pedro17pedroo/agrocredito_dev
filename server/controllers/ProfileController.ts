import { Request, Response } from "express";
import { z } from "zod";
import { ProfileModel, PermissionModel } from "../models/Profile";
import { insertProfileSchema } from "@shared/schema";

export class ProfileController {
  static async getAll(req: Request, res: Response) {
    try {
      const profiles = await ProfileModel.findAll();
      res.json(profiles);
    } catch (error) {
      console.error("Get all profiles error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await ProfileModel.findById(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await ProfileModel.create(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Create profile error:", error);
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

      await ProfileModel.update(id, updateData);
      res.json({ message: "Perfil atualizado com sucesso" });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if profile exists and is not a system profile
      const profile = await ProfileModel.findById(id);
      if (!profile) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }

      if (profile.isSystem) {
        return res.status(400).json({ message: "Perfis do sistema não podem ser eliminados" });
      }

      await ProfileModel.delete(id);
      res.json({ message: "Perfil eliminado com sucesso" });
    } catch (error) {
      console.error("Delete profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getPermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permissions = await ProfileModel.getPermissions(id);
      res.json(permissions);
    } catch (error) {
      console.error("Get profile permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async addPermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;

      if (!permissionId) {
        return res.status(400).json({ message: "ID da permissão é obrigatório" });
      }

      await ProfileModel.addPermission(id, permissionId);
      res.json({ message: "Permissão adicionada com sucesso" });
    } catch (error) {
      console.error("Add permission error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async removePermission(req: Request, res: Response) {
    try {
      const { id, permissionId } = req.params;
      await ProfileModel.removePermission(id, permissionId);
      res.json({ message: "Permissão removida com sucesso" });
    } catch (error) {
      console.error("Remove permission error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export class PermissionController {
  static async getAll(req: Request, res: Response) {
    try {
      const permissions = await PermissionModel.findAll();
      res.json(permissions);
    } catch (error) {
      console.error("Get all permissions error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}