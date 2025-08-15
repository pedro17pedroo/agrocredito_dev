import { db } from "./db";
import { eq } from "drizzle-orm";
import { creditApplications } from "@shared/schema";

export async function updateApplicationsFinancial() {
  try {
    console.log("💰 Atualizando campos financeiros das aplicações existentes...");

    // Atualizar aplicação de milho
    await db
      .update(creditApplications)
      .set({
        monthlyIncome: "180000.00",
        expectedProjectIncome: "95000.00",
        monthlyExpenses: "120000.00",
        otherDebts: "25000.00",
        familyMembers: 5,
        experienceYears: 8
      })
      .where(eq(creditApplications.projectName, "Cultivo de Milho - Época das Chuvas"));

    // Atualizar aplicação de gado
    await db
      .update(creditApplications)
      .set({
        monthlyIncome: "320000.00",
        expectedProjectIncome: "150000.00",
        monthlyExpenses: "180000.00",
        otherDebts: "45000.00",
        familyMembers: 7,
        experienceYears: 15
      })
      .where(eq(creditApplications.projectName, "Criação de Gado Bovino"));

    // Atualizar aplicação de mandioca
    await db
      .update(creditApplications)
      .set({
        monthlyIncome: "125000.00",
        expectedProjectIncome: "65000.00",
        monthlyExpenses: "85000.00",
        otherDebts: "15000.00",
        familyMembers: 4,
        experienceYears: 6
      })
      .where(eq(creditApplications.projectName, "Plantação de Mandioca"));

    // Atualizar aplicação de avicultura
    await db
      .update(creditApplications)
      .set({
        monthlyIncome: "210000.00",
        expectedProjectIncome: "85000.00",
        monthlyExpenses: "140000.00",
        otherDebts: "30000.00",
        familyMembers: 6,
        experienceYears: 10
      })
      .where(eq(creditApplications.projectName, "Avicultura - Galinhas Poedeiras"));

    // Atualizar aplicação de horticultura
    await db
      .update(creditApplications)
      .set({
        monthlyIncome: "95000.00",
        expectedProjectIncome: "45000.00",
        monthlyExpenses: "65000.00",
        otherDebts: "8000.00",
        familyMembers: 3,
        experienceYears: 4
      })
      .where(eq(creditApplications.projectName, "Horta Comunitária - Produtos Hortícolas"));

    console.log("✅ Campos financeiros atualizados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar campos financeiros:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateApplicationsFinancial()
    .then(() => {
      console.log("Atualização de campos financeiros executada com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro na atualização de campos financeiros:", error);
      process.exit(1);
    });
}