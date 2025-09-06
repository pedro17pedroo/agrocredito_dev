import { Request, Response } from "express";
import { z } from "zod";
import { CreditApplicationModel } from "../models/CreditApplication";
import { AccountModel } from "../models/Account";
import { NotificationModel } from "../models/Notification";
import { UserModel } from "../models/User";
import { insertCreditApplicationSchema } from "@shared/schema";

export class CreditApplicationController {
  static async create(req: any, res: Response) {
    try {
      const { documentIds, ...applicationBody } = req.body;
      
      console.log('📝 Criando aplicação de crédito...');
      console.log('📄 DocumentIds recebidos:', documentIds);
      console.log('📋 Dados da aplicação:', applicationBody);
      
      const applicationData = insertCreditApplicationSchema.parse({
        ...applicationBody,
        userId: req.user.id,
      });

      const application = await CreditApplicationModel.create(applicationData);
      console.log('✅ Aplicação criada com ID:', application.id);

      // Associate documents with the credit application if provided
      if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
        console.log('🔗 Associando documentos à aplicação...');
        const { DocumentModel } = await import("../models/Document");
        
        try {
          const associations = await DocumentModel.associateWithCreditApplication(application.id, documentIds);
          console.log('✅ Documentos associados com sucesso:', associations.length);
        } catch (error) {
          console.error(`❌ Erro ao associar documentos com aplicação ${application.id}:`, error);
          // Log error but don't fail the application creation
        }
      } else {
        console.log('⚠️ Nenhum documento fornecido para associação');
      }

      // Create notification for the applicant
      await NotificationModel.create({
        userId: req.user.id,
        type: "application_submitted",
        title: "Solicitação de Crédito Enviada",
        message: `Sua solicitação de crédito para o projeto "${application.projectName}" foi enviada com sucesso e está sendo analisada.`,
        relatedId: application.id,
      });

      // Create notifications for all financial institutions about the new application
      try {
        const financialInstitutions = await UserModel.findFinancialInstitutions();
        
        const notificationPromises = financialInstitutions.map(institution => 
          NotificationModel.create({
            userId: institution.id,
            type: "new_application_received",
            title: "Nova Solicitação de Crédito",
            message: `Nova solicitação de crédito recebida de ${req.user.fullName} para o projeto "${application.projectName}" no valor de ${application.amount} AOA.`,
            relatedId: application.id,
          })
        );
        
        await Promise.all(notificationPromises);
        console.log(`✅ Notificações enviadas para ${financialInstitutions.length} instituições financeiras`);
      } catch (notificationError) {
        console.error('❌ Erro ao enviar notificações para instituições financeiras:', notificationError);
        // Não falhar a criação da aplicação por causa das notificações
      }

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
      const application = await CreditApplicationModel.findByIdWithUser(id);
      
      if (!application) {
        console.log(`Application ${id} not found in database`);
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }

      // Buscar documentos associados à aplicação
      let documents: any[] = [];
      try {
        const { DocumentModel } = await import("../models/Document");
        documents = await DocumentModel.findByCreditApplication(id);
      } catch (error) {
        console.error(`Error fetching documents for application ${id}:`, error);
        // Continue sem documentos se houver erro
      }

      // Retornar aplicação com documentos
      const applicationWithDocuments = {
        ...application,
        documents: documents.map(doc => ({
          id: doc.id,
          documentType: doc.documentType,
          originalFileName: doc.originalFileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          version: doc.version,
          isRequired: doc.isRequired,
          createdAt: doc.createdAt
        }))
      };

      res.json(applicationWithDocuments);
    } catch (error) {
      console.error("Get application error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getAll(req: any, res: Response) {
    try {
      // Verificar se o usuário é admin
      if (req.user?.userType === 'admin') {
        const applications = await CreditApplicationModel.findAllForAdmin();
        return res.json(applications);
      }

      // Para instituições financeiras, verificar se o ID existe
      if (!req.user?.id) {
        return res.status(401).json({ error: 'ID do usuário não encontrado' });
      }

      // Para instituições financeiras, usar o método existente
      const applications = await CreditApplicationModel.findForFinancialInstitution(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error('Erro ao buscar aplicações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
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
      
      if (!user?.id) {
        return res.status(401).json({ error: 'ID do usuário não encontrado' });
      }
      
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

  static async getAllForAdmin(req: any, res: Response) {
    try {
      const user = req.user;
      
      console.log('🏛️ [API] === ENDPOINT /api/admin/credit-applications CHAMADO ===');
       console.log('🏛️ [API] Timestamp:', new Date().toISOString());
       console.log('🏛️ [API] User ID:', user.id);
       console.log('🏛️ [API] User Type:', user.userType || 'N/A');
       console.log('🏛️ [API] User Name:', user.fullName || 'N/A');
      
      // Verificar se o usuário é realmente um administrador
      if (user.userType !== "admin") {
        console.log('🏛️ [API] ❌ ACESSO NEGADO - Usuário não é admin');
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar todas as solicitações." });
      }
      
      console.log('🏛️ [API] ✅ Usuário autorizado como admin, buscando dados...');
      
      const applications = await CreditApplicationModel.findAllForAdmin();
      
      console.log('🏛️ [API] === DADOS RETORNADOS DO MODEL ===');
      console.log('🏛️ [API] Estrutura retornada:', {
        hasNew: !!applications.new,
        hasUnderReview: !!applications.underReview,
        hasHistorical: !!applications.historical,
        newCount: applications.new?.length || 0,
        underReviewCount: applications.underReview?.length || 0,
        historicalCount: applications.historical?.length || 0
      });
      
      const totalCount = (applications.new?.length || 0) + 
                        (applications.underReview?.length || 0) + 
                        (applications.historical?.length || 0);
      
      console.log('🏛️ [API] Total de aplicações encontradas:', totalCount);
      
      // Log detalhado de cada categoria
      if (applications.new && applications.new.length > 0) {
        console.log('🏛️ [API] Aplicações NEW (pendentes):');
        applications.new.forEach((app: any, i: number) => {
          console.log(`🏛️ [API]   ${i+1}. ${app.projectName} - Status: ${app.status} - ID: ${app.id} - User: ${app.userFullName}`);
        });
      }
      
      if (applications.underReview && applications.underReview.length > 0) {
        console.log('🏛️ [API] Aplicações UNDER_REVIEW (em análise):');
        applications.underReview.forEach((app: any, i: number) => {
          console.log(`🏛️ [API]   ${i+1}. ${app.projectName} - Status: ${app.status} - ID: ${app.id} - User: ${app.userFullName}`);
        });
      }
      
      if (applications.historical && applications.historical.length > 0) {
        console.log('🏛️ [API] Aplicações HISTORICAL (aprovadas/rejeitadas):');
        applications.historical.forEach((app: any, i: number) => {
          console.log(`🏛️ [API]   ${i+1}. ${app.projectName} - Status: ${app.status} - ID: ${app.id} - User: ${app.userFullName}`);
        });
      }
      
      console.log('🏛️ [API] ✅ Enviando resposta para o cliente...');
      res.json(applications);
    } catch (error) {
      console.error('🏛️ [API] ❌ ERRO no endpoint getAllForAdmin:', error instanceof Error ? error.message : 'Unknown error');
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