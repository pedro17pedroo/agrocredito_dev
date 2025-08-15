import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { notifications, type Notification, type InsertNotification } from "@shared/schema";

export class NotificationModel {
  static async findByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  static async create(notificationData: InsertNotification): Promise<Notification> {
    // Generate a unique ID for the notification
    const { randomUUID } = await import('crypto');
    const notificationId = randomUUID();
    
    const notificationDataWithId = {
      ...notificationData,
      id: notificationId
    };

    await db
      .insert(notifications)
      .values(notificationDataWithId);

    // Fetch the created notification using the generated ID
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (!notification) {
      throw new Error('Falha ao criar notificação');
    }

    return notification;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.id, notificationId));
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.userId, userId));
  }
}