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
    // Generate a unique ID for the payment
    const { randomUUID } = await import('crypto');
    const paymentId = randomUUID();
    
    const paymentDataWithId = {
      ...paymentData,
      id: paymentId
    };

    await db
      .insert(payments)
      .values(paymentDataWithId);

    // Fetch the created payment using the generated ID
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      throw new Error('Falha ao criar pagamento');
    }

    return payment;
  }
}