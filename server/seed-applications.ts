import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, creditApplications, type InsertCreditApplication } from "@shared/schema";

export async function seedApplications() {
  try {
    console.log("🌾 Criando solicitações de crédito de exemplo...");

    // Buscar o utilizador agricultor
    const [farmer] = await db
      .select()
      .from(users)
      .where(eq(users.phone, "+244923456789"))
      .limit(1);

    if (!farmer) {
      console.log("❌ Utilizador agricultor não encontrado. Execute primeiro o seed principal.");
      return;
    }

    // Lista de solicitações de exemplo
    const sampleApplications: InsertCreditApplication[] = [
      {
        userId: farmer.id,
        projectName: "Cultivo de Milho - Época das Chuvas",
        projectType: "corn",
        description: "Projeto para cultivo de 5 hectares de milho durante a época das chuvas. Incluí preparação do terreno, sementes melhoradas, fertilizantes e pesticidas. Expectativa de produção de 25 toneladas.",
        amount: "750000.00", // 750.000 AOA
        term: 12,
        productivity: "medium",
        agricultureType: "Agricultura de cereais - milho híbrido",
        creditDeliveryMethod: "monthly",
        creditGuaranteeDeclaration: "Ofereço como garantia a hipoteca da propriedade agrícola de 8 hectares localizada na comuna do Kaculama, avaliada em AOA 1,200,000. Adicionalmente, disponibilizo o aval do Sr. António Manuel, comerciante na região.",
        // Campos financeiros
        monthlyIncome: "180000.00", // 180.000 AOA
        expectedProjectIncome: "95000.00", // 95.000 AOA
        monthlyExpenses: "120000.00", // 120.000 AOA
        otherDebts: "25000.00", // 25.000 AOA
        familyMembers: 5,
        experienceYears: 8,
        status: "pending"
      },
      {
        userId: farmer.id,
        projectName: "Criação de Gado Bovino",
        projectType: "cattle",
        description: "Aquisição de 10 cabeças de gado bovino para criação e reprodução. Inclui construção de curral, vacinação e alimentação para os primeiros 6 meses.",
        amount: "2500000.00", // 2.500.000 AOA
        term: 24,
        productivity: "large",
        agricultureType: "Pecuária bovina - criação e reprodução",
        creditDeliveryMethod: "total",
        creditGuaranteeDeclaration: "Ofereço como garantia a hipoteca do terreno de 20 hectares com pastagens, localizado no município de Malanje, avaliado em AOA 4,000,000. Tenho também contrato de fornecimento com o frigorífico local como garantia adicional.",
        // Campos financeiros
        monthlyIncome: "320000.00", // 320.000 AOA
        expectedProjectIncome: "150000.00", // 150.000 AOA
        monthlyExpenses: "180000.00", // 180.000 AOA
        otherDebts: "45000.00", // 45.000 AOA
        familyMembers: 7,
        experienceYears: 15,
        status: "under_review"
      },
      {
        userId: farmer.id,
        projectName: "Plantação de Mandioca",
        projectType: "cassava",
        description: "Cultivo de 3 hectares de mandioca. Projeto inclui preparação do solo, mudas, ferramentas agrícolas e mão-de-obra para plantio e colheita.",
        amount: "450000.00", // 450.000 AOA
        term: 18,
        productivity: "small",
        agricultureType: "Agricultura de tubérculos - mandioca",
        creditDeliveryMethod: "monthly",
        creditGuaranteeDeclaration: "Apresento como garantia o penhor de equipamentos agrícolas (trator e alfaias) avaliados em AOA 650,000, além do aval solidário da Cooperativa Agrícola de Malanje.",
        // Campos financeiros
        monthlyIncome: "125000.00", // 125.000 AOA
        expectedProjectIncome: "65000.00", // 65.000 AOA
        monthlyExpenses: "85000.00", // 85.000 AOA
        otherDebts: "15000.00", // 15.000 AOA
        familyMembers: 4,
        experienceYears: 6,
        status: "approved"
      },
      {
        userId: farmer.id,
        projectName: "Avicultura - Galinhas Poedeiras",
        projectType: "poultry",
        description: "Montagem de aviário para 200 galinhas poedeiras. Inclui construção do galinheiro, aquisição das aves, ração para os primeiros 3 meses e equipamentos.",
        amount: "850000.00", // 850.000 AOA
        term: 15,
        productivity: "medium",
        agricultureType: "Avicultura - produção de ovos",
        creditDeliveryMethod: "total",
        creditGuaranteeDeclaration: "Ofereço como garantia a hipoteca da propriedade onde será construído o aviário, avaliada em AOA 1,100,000, e contrato de fornecimento de ovos com mercados locais.",
        // Campos financeiros
        monthlyIncome: "210000.00", // 210.000 AOA
        expectedProjectIncome: "85000.00", // 85.000 AOA
        monthlyExpenses: "140000.00", // 140.000 AOA
        otherDebts: "30000.00", // 30.000 AOA
        familyMembers: 6,
        experienceYears: 10,
        status: "rejected"
      },
      {
        userId: farmer.id,
        projectName: "Horta Comunitária - Produtos Hortícolas",
        projectType: "horticulture",
        description: "Desenvolvimento de horta para produção de tomate, cebola, alface e pimento. Inclui sistema de irrigação, sementes, fertilizantes orgânicos e ferramentas.",
        amount: "320000.00", // 320.000 AOA
        term: 9,
        productivity: "small",
        agricultureType: "Horticultura - produtos frescos",
        creditDeliveryMethod: "total",
        creditGuaranteeDeclaration: "Apresento como garantia equipamentos de irrigação e ferramentas agrícolas avaliados em AOA 400,000, além do aval do presidente da associação de agricultores locais.",
        // Campos financeiros
        monthlyIncome: "95000.00", // 95.000 AOA
        expectedProjectIncome: "45000.00", // 45.000 AOA
        monthlyExpenses: "65000.00", // 65.000 AOA
        otherDebts: "8000.00", // 8.000 AOA
        familyMembers: 3,
        experienceYears: 4,
        status: "pending"
      }
    ];

    // Criar as solicitações
    for (const application of sampleApplications) {
      const [existing] = await db
        .select()
        .from(creditApplications)
        .where(eq(creditApplications.projectName, application.projectName))
        .limit(1);

      if (!existing) {
        await db.insert(creditApplications).values(application);
        console.log(`  ✅ Solicitação criada: ${application.projectName} (${application.status})`);
      } else {
        console.log(`  ⏭️ Solicitação já existe: ${application.projectName}`);
      }
    }

    console.log("🎉 Solicitações de crédito de exemplo criadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar solicitações de exemplo:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedApplications()
    .then(() => {
      console.log("Seed de solicitações executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro no seed de solicitações:", error);
      process.exit(1);
    });
}