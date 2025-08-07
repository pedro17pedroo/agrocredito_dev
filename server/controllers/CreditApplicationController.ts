import { Request, Response } from "express";
import { z } from "zod";
import { CreditApplicationModel } from "../models/CreditApplication";
import { AccountModel } from "../models/Account";
import { NotificationModel } from "../models/Notification";
import { insertCreditApplicationSchema } from "@shared/schema";

export class CreditApplicationController {
  static async create(req: any, res: Response) {
    try {
      const applicationData = insertCreditApplicationSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const application = await CreditApplicationModel.create(applicationData);

      // Create notification for admin/financial institutions
      await NotificationModel.create({
        userId: req.user.id,
        type: "application_submitted",
        title: "Solicitação de Crédito Enviada",
        message: `Sua solicitação de crédito para o projeto "${application.projectName}" foi enviada com sucesso e está sendo analisada.`,
        relatedId: application.id,
      });

      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getByUserId(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const applications = await CreditApplicationModel.findByUserId(userId);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const application = await CreditApplicationModel.findById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }

      res.json(application);
    } catch (error) {
      console.error("Get application error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const applications = await CreditApplicationModel.findAll();
      res.json(applications);
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async updateStatus(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const reviewerId = req.user.id;

      await CreditApplicationModel.updateStatus(id, status, rejectionReason, reviewerId);

      const application = await CreditApplicationModel.findById(id);
      if (!application) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }

      // Create notification for the applicant
      let notificationMessage = "";
      let notificationType = "";

      switch (status) {
        case "under_review":
          notificationMessage = `Sua solicitação de crédito para "${application.projectName}" está sendo analisada.`;
          notificationType = "application_under_review";
          break;
        case "approved":
          notificationMessage = `Parabéns! Sua solicitação de crédito para "${application.projectName}" foi aprovada.`;
          notificationType = "application_approved";
          
          // Create account for approved application
          await AccountModel.create({
            applicationId: application.id,
            userId: application.userId,
            financialInstitutionId: reviewerId,
            totalAmount: application.amount,
            outstandingBalance: application.amount,
            monthlyPayment: "0", // This should be calculated based on terms
          });
          break;
        case "rejected":
          notificationMessage = `Sua solicitação de crédito para "${application.projectName}" foi rejeitada. Motivo: ${rejectionReason}`;
          notificationType = "application_rejected";
          break;
      }

      await NotificationModel.create({
        userId: application.userId,
        type: notificationType,
        title: "Status da Solicitação Atualizado",
        message: notificationMessage,
        relatedId: application.id,
      });

      res.json({ message: "Status atualizado com sucesso" });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getForFinancialInstitution(req: any, res: Response) {
    try {
      const user = req.user;
      let financialInstitutionId = user.id;
      
      // If user is an internal user of financial institution, use parent institution ID
      if (user.parentInstitutionId) {
        financialInstitutionId = user.parentInstitutionId;
      }
      
      const applications = await CreditApplicationModel.findForFinancialInstitution(financialInstitutionId);
      res.json(applications);
    } catch (error) {
      console.error("Get applications for financial institution error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static simulate(req: Request, res: Response) {
    try {
      const { amount, term, interestRate } = req.body;

      if (!amount || !term || !interestRate) {
        return res.status(400).json({ message: "Amount, term, and interest rate are required" });
      }

      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                            (Math.pow(1 + monthlyRate, term) - 1);

      const totalAmount = monthlyPayment * term;
      const totalInterest = totalAmount - amount;

      res.json({
        amount: parseFloat(amount),
        term: parseInt(term),
        interestRate: parseFloat(interestRate),
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
      });
    } catch (error) {
      console.error("Simulate credit error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}