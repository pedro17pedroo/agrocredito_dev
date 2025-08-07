import { db } from "./db";
import { eq } from "drizzle-orm";
import { creditApplications, accounts, notifications, users, type InsertAccount, type InsertNotification } from "@shared/schema";

export async function createTestAccount() {
  try {
    console.log("💰 Criando conta de teste para solicitação aprovada...");

    // Buscar a solicitação de mandioca aprovada
    const [approvedApplication] = await db
      .select()
      .from(creditApplications)
      .where(eq(creditApplications.projectName, "Plantação de Mandioca"))
      .limit(1);

    if (!approvedApplication) {
      console.log("❌ Solicitação aprovada não encontrada.");
      return;
    }

    // Verificar se já existe uma conta para esta solicitação
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.applicationId, approvedApplication.id))
      .limit(1);

    if (existingAccount) {
      console.log("⏭️ Conta já existe para esta solicitação");
      return;
    }

    // Calcular os valores da conta
    const principal = parseFloat(approvedApplication.amount);
    const interestRate = 15; // Taxa base para mandioca
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = approvedApplication.term;
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalAmount = monthlyPayment * numPayments;
    
    // Próxima data de pagamento (30 dias a partir de hoje)
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    // Buscar a instituição financeira
    const [financialInstitution] = await db
      .select()
      .from(users)
      .where(eq(users.phone, "+244934567890"))
      .limit(1);

    if (!financialInstitution) {
      console.log("❌ Instituição financeira não encontrada.");
      return;
    }

    // Criar a conta
    const accountData: InsertAccount = {
      applicationId: approvedApplication.id,
      userId: approvedApplication.userId,
      financialInstitutionId: financialInstitution.id,
      totalAmount: totalAmount.toString(),
      outstandingBalance: totalAmount.toString(),
      monthlyPayment: monthlyPayment.toString(),
      nextPaymentDate,
    };

    const [newAccount] = await db.insert(accounts).values(accountData).returning();

    // Criar notificação de aprovação
    const notificationData: InsertNotification = {
      userId: approvedApplication.userId,
      type: "application_approved",
      title: "Conta Criada!",
      message: `Conta criada para "${approvedApplication.projectName}". Primeira parcela vence em 30 dias.`,
      relatedId: newAccount.id,
    };

    await db.insert(notifications).values(notificationData);

    console.log("  ✅ Conta criada com sucesso!");
    console.log(`  💰 Valor total: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalAmount)}`);
    console.log(`  📅 Parcela mensal: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(monthlyPayment)}`);
    console.log(`  🔔 Notificação enviada ao utilizador`);

    console.log("🎉 Conta de teste criada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar conta de teste:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestAccount()
    .then(() => {
      console.log("Criação de conta de teste executada com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro na criação de conta de teste:", error);
      process.exit(1);
    });
}