import { seedDatabase } from "./seed";
import { seedApplications } from "./seed-applications";
import { seedCreditPrograms } from "./seed-credit-programs";
import { createTestAccount } from "./create-test-account";

async function runAllSeeds() {
  try {
    console.log("🚀 Iniciando processo completo de seed...\n");
    
    // 1. Seed básico (usuarios, perfis, permissões)
    await seedDatabase();
    console.log("\n");
    
    // 2. Seed das aplicações de crédito
    await seedApplications();
    console.log("\n");
    
    // 3. Seed dos programas de crédito
    await seedCreditPrograms();
    console.log("\n");
    
    // 4. Criar conta de teste
    await createTestAccount();
    console.log("\n");
    
    console.log("🎉 Processo completo de seed finalizado com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro no processo de seed:", error);
    throw error;
  }
}

// Run all seeds if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllSeeds()
    .then(() => {
      console.log("✅ Todos os seeds executados com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro nos seeds:", error);
      process.exit(1);
    });
}

export { runAllSeeds };