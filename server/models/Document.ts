import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { documents, creditApplicationDocuments, type Document, type InsertDocument, type CreditApplicationDocument, type InsertCreditApplicationDocument } from "../../shared/schema";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

export class DocumentModel {
  /**
   * Cria um novo documento para um usuário
   */
  static async create(data: InsertDocument): Promise<Document> {
    const id = uuidv4();
    
    // Se este documento está substituindo outro, marca o anterior como inativo
    if (data.replacedById) {
      await db.update(documents)
        .set({ isActive: false })
        .where(eq(documents.id, data.replacedById));
    }
    
    await db.insert(documents).values({
      id,
      ...data,
    });
    
    const result = await db.select().from(documents).where(eq(documents.id, id));
    return result[0];
  }

  /**
   * Busca documentos ativos de um usuário por tipo
   */
  static async findByUserAndType(userId: string, documentType: string): Promise<Document[]> {
    return await db.select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.documentType, documentType as any),
          eq(documents.isActive, true)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  /**
   * Busca todos os documentos ativos de um usuário
   */
  static async findByUser(userId: string): Promise<Document[]> {
    return await db.select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.isActive, true)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  /**
   * Busca um documento por ID
   */
  static async findById(id: string): Promise<Document | null> {
    const result = await db.select().from(documents).where(eq(documents.id, id));
    return result[0] || null;
  }

  /**
   * Substitui um documento existente por uma nova versão
   */
  static async replaceDocument(oldDocumentId: string, newDocumentData: Omit<InsertDocument, 'replacedById'>): Promise<Document> {
    const oldDocument = await this.findById(oldDocumentId);
    if (!oldDocument) {
      throw new Error('Documento original não encontrado');
    }

    // Cria o novo documento com versão incrementada
    const newDocument = await this.create({
      ...newDocumentData,
      version: oldDocument.version + 1,
      replacedById: oldDocumentId,
    });

    // Remove o arquivo antigo do sistema de arquivos
    try {
      await fs.unlink(oldDocument.filePath);
    } catch (error) {
      console.warn(`Erro ao remover arquivo antigo:`, error);
    }

    return newDocument;
  }

  /**
   * Remove um documento (marca como inativo e remove arquivo)
   */
  static async delete(id: string): Promise<boolean> {
    const document = await this.findById(id);
    if (!document) {
      return false;
    }

    // Marca como inativo
    await db.update(documents)
      .set({ isActive: false })
      .where(eq(documents.id, id));

    // Remove o arquivo do sistema de arquivos
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.warn(`Erro ao remover arquivo: ${error}`);
    }

    return true;
  }

  /**
   * Associa documentos a uma aplicação de crédito
   */
  static async associateWithCreditApplication(
    creditApplicationId: string,
    documentIds: string[],
    requiredDocuments: string[] = []
  ): Promise<CreditApplicationDocument[]> {
    const associations: CreditApplicationDocument[] = [];

    for (const documentId of documentIds) {
      const id = uuidv4();
      const isRequired = requiredDocuments.includes(documentId);

      await db.insert(creditApplicationDocuments).values({
        id,
        applicationId: creditApplicationId,
        documentId,
        isRequired,
      });

      const result = await db.select()
        .from(creditApplicationDocuments)
        .where(eq(creditApplicationDocuments.id, id));
      
      associations.push(result[0]);
    }

    return associations;
  }

  /**
   * Busca documentos associados a uma aplicação de crédito
   */
  static async findByCreditApplication(creditApplicationId: string): Promise<(Document & { isRequired: boolean })[]> {
    const result = await db.select({
      id: documents.id,
      userId: documents.userId,
      documentType: documents.documentType,
      fileName: documents.fileName,
      originalFileName: documents.originalFileName,
      filePath: documents.filePath,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      version: documents.version,
      isActive: documents.isActive,
      replacedById: documents.replacedById,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      isRequired: creditApplicationDocuments.isRequired,
    })
    .from(documents)
    .innerJoin(
      creditApplicationDocuments,
      eq(documents.id, creditApplicationDocuments.documentId)
    )
    .where(
      and(
        eq(creditApplicationDocuments.applicationId, creditApplicationId),
        eq(documents.isActive, true)
      )
    )
    .orderBy(desc(documents.createdAt));

    return result;
  }

  /**
   * Remove associação entre documento e aplicação de crédito
   */
  static async removeFromCreditApplication(creditApplicationId: string, documentId: string): Promise<boolean> {
    const result = await db.delete(creditApplicationDocuments)
      .where(
        and(
          eq(creditApplicationDocuments.applicationId, creditApplicationId),
          eq(creditApplicationDocuments.documentId, documentId)
        )
      );

    return (result as any).rowsAffected > 0;
  }

  /**
   * Verifica se um usuário pode acessar um documento
   */
  static async canUserAccessDocument(userId: string, documentId: string, userType: string): Promise<boolean> {
    try {
      const document = await this.findById(documentId);
      if (!document) {
        return false;
      }

      // O próprio usuário sempre pode acessar seus documentos
      if (document.userId === userId) {
        return true;
      }

      // Se for admin, pode acessar qualquer documento
      if (userType === 'admin') {
        return true;
      }

      // Instituições financeiras podem acessar documentos de aplicações que estão revisando
      if (userType === 'financial_institution') {
        const associations = await db.select()
          .from(creditApplicationDocuments)
          .where(eq(creditApplicationDocuments.documentId, documentId));

        return associations.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar acesso ao documento:', error);
      return false;
    }
  }
}