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
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
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