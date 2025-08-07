import { Request, Response } from "express";
import { AccountModel } from "../models/Account";
import { PaymentModel } from "../models/Payment";
import { NotificationModel } from "../models/Notification";

export class AccountController {
  static async getByUserId(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const accounts = await AccountModel.findByUserId(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const account = await AccountModel.findById(id);
      
      if (!account) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      res.json(account);
    } catch (error) {
      console.error("Get account error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const accounts = await AccountModel.findAll();
      res.json(accounts);
    } catch (error) {
      console.error("Get all accounts error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getByFinancialInstitution(req: any, res: Response) {
    try {
      const user = req.user;
      let financialInstitutionId = user.id;
      
      // If user is an internal user of financial institution, use parent institution ID
      if (user.parentInstitutionId) {
        financialInstitutionId = user.parentInstitutionId;
      }
      
      const accounts = await AccountModel.findByFinancialInstitution(financialInstitutionId);
      res.json(accounts);
    } catch (error) {
      console.error("Get accounts by financial institution error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async createPayment(req: any, res: Response) {
    try {
      const { accountId } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valor do pagamento inválido" });
      }

      const account = await AccountModel.findById(accountId);
      if (!account) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      // Create payment record
      await PaymentModel.create({
        accountId,
        amount: amount.toString(),
      });

      // Update account balance
      const newBalance = parseFloat(account.outstandingBalance) - amount;
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      await AccountModel.updateBalance(accountId, newBalance, nextPaymentDate);

      // Create notification
      await NotificationModel.create({
        userId: account.userId,
        type: "payment_received",
        title: "Pagamento Registado",
        message: `Pagamento de ${amount} AOA foi registado com sucesso. Saldo restante: ${newBalance} AOA.`,
        relatedId: accountId,
      });

      res.json({ message: "Pagamento registado com sucesso" });
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async getPayments(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const payments = await PaymentModel.findByAccountId(accountId);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}