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

  static async findByBI(bi: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.bi, bi));
    return user;
  }

  static async findAll(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  static async create(userData: InsertUser): Promise<User> {
    // Generate a unique ID for the user
    const { randomUUID } = await import('crypto');
    const userId = randomUUID();
    
    const userDataWithId = {
      ...userData,
      id: userId
    };

    await db
      .insert(users)
      .values(userDataWithId);

    // Fetch the created user using the generated ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('Falha ao criar usuário');
    }

    return user;
  }

  static async update(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    // Remove any timestamp fields from userData to avoid conflicts
    const { createdAt, updatedAt, ...cleanUserData } = userData as any;
    
    await db
      .update(users)
      .set(cleanUserData)
      .where(eq(users.id, id));

    // Fetch the updated user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  }

  static async assignProfile(userId: string, profileId: string): Promise<User | undefined> {
    await db
      .update(users)
      .set({ profileId, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Fetch the updated user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

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

  static async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  static async delete(id: string): Promise<boolean> {
    // First check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return false;
    }

    // Delete the user
    await db
      .delete(users)
      .where(eq(users.id, id));
    
    return true;
  }
}