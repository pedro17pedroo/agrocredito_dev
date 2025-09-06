import { Request, Response } from "express";
import { db } from "../db.js";
import { creditPrograms, insertCreditProgramSchema, InsertCreditProgram } from "../../shared/schema.js";
import { eq, and } from "drizzle-orm";

export class CreditProgramController {
  // Get all credit programs for a financial institution
  static async getPrograms(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      const programs = await db
        .select()
        .from(creditPrograms)
        .where(eq(creditPrograms.financialInstitutionId, userId))
        .orderBy(creditPrograms.createdAt);

      // Parse JSON fields before sending response
      const parsedPrograms = programs.map(program => ({
        ...program,
        projectTypes: typeof program.projectTypes === 'string' 
          ? JSON.parse(program.projectTypes) 
          : program.projectTypes
      }));

      res.json(parsedPrograms);
    } catch (error) {
      console.error("Error fetching credit programs:", error);
      res.status(500).json({ error: "Erro ao carregar programas de crédito" });
    }
  }

  // Get all public credit programs (for farmers/companies to view)
  static async getAllPublicPrograms(_req: Request, res: Response) {
    try {
      const programs = await db
        .select({
          id: creditPrograms.id,
          name: creditPrograms.name,
          description: creditPrograms.description,
          projectTypes: creditPrograms.projectTypes,
          minAmount: creditPrograms.minAmount,
          maxAmount: creditPrograms.maxAmount,
          minTerm: creditPrograms.minTerm,
          maxTerm: creditPrograms.maxTerm,
          interestRate: creditPrograms.interestRate,
          effortRate: creditPrograms.effortRate,
          processingFee: creditPrograms.processingFee,
          financialInstitutionId: creditPrograms.financialInstitutionId,
        })
        .from(creditPrograms)
        .where(eq(creditPrograms.isActive, true))
        .orderBy(creditPrograms.createdAt);

      // Parse JSON fields before sending response
      const parsedPrograms = programs.map(program => ({
        ...program,
        projectTypes: typeof program.projectTypes === 'string' 
          ? JSON.parse(program.projectTypes) 
          : program.projectTypes
      }));

      res.json(parsedPrograms);
    } catch (error) {
      console.error("Error fetching public credit programs:", error);
      res.status(500).json({ error: "Erro ao carregar programas de crédito" });
    }
  }

  // Get credit programs by financial institution (for farmers/companies)
  static async getProgramsByInstitution(req: Request, res: Response) {
    try {
      const { institutionId } = req.params;

      const programs = await db
        .select({
          id: creditPrograms.id,
          name: creditPrograms.name,
          description: creditPrograms.description,
          projectTypes: creditPrograms.projectTypes,
          minAmount: creditPrograms.minAmount,
          maxAmount: creditPrograms.maxAmount,
          minTerm: creditPrograms.minTerm,
          maxTerm: creditPrograms.maxTerm,
          interestRate: creditPrograms.interestRate,
          effortRate: creditPrograms.effortRate,
          processingFee: creditPrograms.processingFee,
          financialInstitutionId: creditPrograms.financialInstitutionId,
        })
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.financialInstitutionId, institutionId!),
            eq(creditPrograms.isActive, true)
          )
        )
        .orderBy(creditPrograms.createdAt);

      // Parse JSON fields before sending response
      const parsedPrograms = programs.map(program => ({
        ...program,
        projectTypes: typeof program.projectTypes === 'string' 
          ? JSON.parse(program.projectTypes) 
          : program.projectTypes
      }));

      res.json(parsedPrograms);
    } catch (error) {
      console.error("Error fetching programs by institution:", error);
      res.status(500).json({ error: "Erro ao carregar programas de crédito" });
    }
  }

  // Get single credit program
  static async getProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      const program = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (program.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      // Parse JSON fields before sending response
      const parsedProgram = {
        ...program[0],
        projectTypes: typeof program[0].projectTypes === 'string' 
          ? JSON.parse(program[0].projectTypes) 
          : program[0].projectTypes
      };

      res.json(parsedProgram);
    } catch (error) {
      console.error("Error fetching credit program:", error);
      res.status(500).json({ error: "Erro ao carregar programa de crédito" });
    }
  }

  // Create new credit program
  static async createProgram(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Validate request body
      const validationResult = insertCreditProgramSchema.safeParse({
        ...req.body,
        financialInstitutionId: userId,
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: validationResult.error.errors 
        });
      }

      const programData: InsertCreditProgram = validationResult.data;

      // Generate a unique ID for the program
      const { randomUUID } = await import('crypto');
      const programId = randomUUID();
      
      const programDataWithId = {
        ...programData,
        id: programId
      };

      await db
        .insert(creditPrograms)
        .values(programDataWithId);

      // Fetch the created program using the generated ID
      const [newProgram] = await db
        .select()
        .from(creditPrograms)
        .where(eq(creditPrograms.id, programId))
        .limit(1);

      // Parse JSON fields before sending response
      const parsedProgram = {
        ...newProgram,
        projectTypes: typeof newProgram.projectTypes === 'string' 
          ? JSON.parse(newProgram.projectTypes) 
          : newProgram.projectTypes
      };

      res.status(201).json(parsedProgram);
    } catch (error) {
      console.error("Error creating credit program:", error);
      res.status(500).json({ error: "Erro ao criar programa de crédito" });
    }
  }

  // Update credit program
  static async updateProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Check if program exists and belongs to this institution
      const existingProgram = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      // Validate update data
      const updateData = insertCreditProgramSchema.partial().safeParse(req.body);

      if (!updateData.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: updateData.error.errors 
        });
      }

      const [updatedProgram] = await db
        .update(creditPrograms)
        .set({
          ...updateData.data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        );

      // Fetch the updated program
      const [updatedProgramData] = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (!updatedProgramData) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      // Parse JSON fields before sending response
      const parsedProgram = {
        ...updatedProgramData,
        projectTypes: typeof updatedProgramData.projectTypes === 'string' 
          ? JSON.parse(updatedProgramData.projectTypes) 
          : updatedProgramData.projectTypes
      };

      res.json(parsedProgram);
    } catch (error) {
      console.error("Error updating credit program:", error);
      res.status(500).json({ error: "Erro ao atualizar programa de crédito" });
    }
  }

  // Delete credit program
  static async deleteProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Check if program exists and belongs to this institution
      const existingProgram = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      await db
        .delete(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        );

      res.json({ message: "Programa de crédito eliminado com sucesso" });
    } catch (error) {
      console.error("Error deleting credit program:", error);
      res.status(500).json({ error: "Erro ao eliminar programa de crédito" });
    }
  }

  // Toggle program active status
  static async toggleActiveStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Get current program
      const existingProgram = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      const [updatedProgram] = await db
        .update(creditPrograms)
        .set({
          isActive: !existingProgram[0].isActive,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        );

      // Fetch the updated program
      const [toggledProgramData] = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (!toggledProgramData) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      // Parse JSON fields before sending response
      const parsedProgram = {
        ...toggledProgramData,
        projectTypes: typeof toggledProgramData.projectTypes === 'string' 
          ? JSON.parse(toggledProgramData.projectTypes) 
          : toggledProgramData.projectTypes
      };

      res.json(parsedProgram);
    } catch (error) {
      console.error("Error toggling program status:", error);
      res.status(500).json({ error: "Erro ao alterar estado do programa" });
    }
  }
}