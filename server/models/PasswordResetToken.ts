import { eq, and, gt } from "drizzle-orm";
import { db } from "../db";
import { passwordResetTokens } from "@shared/schema";

type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export class PasswordResetTokenModel {
  /**
   * Cria um novo token OTP para recuperação de senha
   */
  static async create(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const { randomUUID } = await import('crypto');
    const tokenId = randomUUID();
    
    const tokenDataWithId = {
      ...tokenData,
      id: tokenId
    };

    await db
      .insert(passwordResetTokens)
      .values(tokenDataWithId);

    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.id, tokenId))
      .limit(1);

    if (!token) {
      throw new Error('Falha ao criar token de recuperação');
    }

    return token;
  }

  /**
   * Busca um token pelo ID
   */
  static async findById(tokenId: string): Promise<PasswordResetToken | undefined> {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.id, tokenId))
      .limit(1);

    return token;
  }

  /**
   * Busca um token válido (não usado e não expirado) pelo código e identificador do usuário
   */
  static async findValidToken(
    userId: string, 
    token: string
  ): Promise<PasswordResetToken | undefined> {
    const now = new Date();
    
    const [foundToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.isUsed, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    return foundToken;
  }

  /**
   * Busca um token válido pelo email/telefone e código
   */
  static async findValidTokenByContact(
    contact: string,
    token: string,
    deliveryMethod: 'email' | 'sms'
  ): Promise<PasswordResetToken | undefined> {
    const now = new Date();
    const contactField = deliveryMethod === 'email' ? passwordResetTokens.email : passwordResetTokens.phone;
    
    const [foundToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(contactField, contact),
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.deliveryMethod, deliveryMethod),
          eq(passwordResetTokens.isUsed, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    return foundToken;
  }

  /**
   * Marca um token como usado
   */
  static async markAsUsed(tokenId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  /**
   * Remove todos os tokens não utilizados de um usuário (para evitar múltiplos tokens ativos)
   */
  static async invalidateUserTokens(userId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          eq(passwordResetTokens.isUsed, false)
        )
      );
  }

  /**
   * Gera um código OTP de 6 dígitos
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calcula o tempo de expiração do token (15 minutos a partir de agora)
   */
  static getExpirationTime(): Date {
    const now = new Date();
    return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos
  }
}