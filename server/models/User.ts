import { eq, desc, inArray } from "drizzle-orm";
import { db } from "../db";
import { users } from "@shared/schema";

type User = typeof users.$inferSelect;
type InsertUser = typeof users.$inferInsert;

export class UserModel {
  static async findById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  static async findByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  static async findAll(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  static async create(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  static async update(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  static async assignProfile(userId: string, profileId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ profileId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  static async findByParentInstitution(institutionId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.parentInstitutionId, institutionId))
      .orderBy(desc(users.createdAt));
  }

  static async findClients(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(inArray(users.userType, ['farmer', 'company', 'cooperative']))
      .orderBy(desc(users.createdAt));
  }

  static async findFinancialInstitutions(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.userType, 'financial_institution'))
      .orderBy(desc(users.createdAt));
  }
}