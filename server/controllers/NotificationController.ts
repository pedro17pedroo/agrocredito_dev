import { Request, Response } from "express";
import { NotificationModel } from "../models/Notification";

export class NotificationController {
  static async getByUserId(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const notifications = await NotificationModel.findByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await NotificationModel.markAsRead(id);
      res.json({ message: "Notificação marcada como lida" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async markAllAsRead(req: any, res: Response) {
    try {
      const userId = req.user.id;
      await NotificationModel.markAllAsRead(userId);
      res.json({ message: "Todas as notificações marcadas como lidas" });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}