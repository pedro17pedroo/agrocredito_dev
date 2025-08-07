import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { accounts, type Account, type InsertAccount } from "@shared/schema";

export class AccountModel {
  static async findById(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  static async findByUserId(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));
  }

  static async findByFinancialInstitution(financialInstitutionId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.financialInstitutionId, financialInstitutionId))
      .orderBy(desc(accounts.createdAt));
  }

  static async findAll(): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .orderBy(desc(accounts.createdAt));
  }

  static async create(accountData: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(accountData)
      .returning();
    return account;
  }

  static async updateBalance(id: string, newBalance: number, nextPaymentDate?: Date): Promise<void> {
    const updateData: any = {
      outstandingBalance: newBalance.toString(),
      updatedAt: new Date(),
    };

    if (nextPaymentDate) {
      updateData.nextPaymentDate = nextPaymentDate;
    }

    await db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.id, id));
  }
}