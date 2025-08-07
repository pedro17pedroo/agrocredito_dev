import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { payments, type Payment, type InsertPayment } from "@shared/schema";

export class PaymentModel {
  static async findByAccountId(accountId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.accountId, accountId))
      .orderBy(desc(payments.paymentDate));
  }

  static async create(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }
}