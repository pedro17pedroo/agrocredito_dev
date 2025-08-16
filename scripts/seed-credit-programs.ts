import type { InsertCreditProgram } from '@shared/schema';
import { creditPrograms, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../server/db';

export async function seedCreditPrograms() {
  try {
    console.log('💳 Criando programas de crédito de exemplo...');

    // Buscar a instituição financeira de teste
    const [financialInstitution] = await db
      .select()
      .from(users)
      .where(eq(users.phone, '+244934567890'))
      .limit(1);

    if (!financialInstitution) {
      console.log(
        '❌ Instituição financeira não encontrada. Execute primeiro o seed principal.'
      );
      return;
    }

    // Lista de programas de crédito de exemplo
    const samplePrograms: InsertCreditProgram[] = [
      {
        financialInstitutionId: financialInstitution.id,
        name: 'AgriCredi Milho Plus',
        description:
          'Programa especial para produtores de milho com condições diferenciadas. Taxa reduzida e prazo estendido para plantações de grande escala.',
        projectTypes: JSON.stringify(['corn']),
        minAmount: '200000.00', // 200.000 AOA
        maxAmount: '5000000.00', // 5.000.000 AOA
        minTerm: 6,
        maxTerm: 24,
        interestRate: '12.50', // 12,5% ao ano
        effortRate: '35.00', // Taxa de esforço máxima 35%
        processingFee: '2.50', // Taxa de processamento 2,5%
        isActive: true,
        requirements: JSON.stringify([
          'Experiência mínima de 2 anos na cultura',
          'Terreno próprio ou contrato de arrendamento',
          'Plano de cultivo detalhado',
          'Comprovativo de rendimentos',
        ]),
        benefits: JSON.stringify([
          'Taxa de juro preferencial',
          'Carência de 6 meses para início dos pagamentos',
          'Assistência técnica incluída',
          'Seguro agrícola opcional',
        ]),
      },
      {
        financialInstitutionId: financialInstitution.id,
        name: 'Pecuária Sustentável',
        description:
          'Financiamento para projetos de pecuária bovina e caprina com foco na sustentabilidade e modernização das práticas de criação.',
        projectTypes: JSON.stringify(['cattle']),
        minAmount: '1000000.00', // 1.000.000 AOA
        maxAmount: '10000000.00', // 10.000.000 AOA
        minTerm: 12,
        maxTerm: 36,
        interestRate: '15.00', // 15% ao ano
        effortRate: '40.00', // Taxa de esforço máxima 40%
        processingFee: '3.00', // Taxa de processamento 3%
        isActive: true,
        requirements: JSON.stringify([
          'Certificado de posse de terreno',
          'Experiência comprovada em pecuária',
          'Estudo de viabilidade do projeto',
          'Garantias adequadas ao valor solicitado',
        ]),
        benefits: JSON.stringify([
          'Acompanhamento veterinário',
          'Formação em técnicas modernas',
          'Desconto na aquisição de rações',
          'Apoio na comercialização',
        ]),
      },
      {
        financialInstitutionId: financialInstitution.id,
        name: 'Jovem Agricultor',
        description:
          'Programa dedicado a jovens empreendedores agrícolas entre 18-35 anos. Condições especiais para incentivar a juventude no setor agrícola.',
        projectTypes: JSON.stringify([
          'corn',
          'cassava',
          'horticulture',
          'poultry',
        ]),
        minAmount: '100000.00', // 100.000 AOA
        maxAmount: '2000000.00', // 2.000.000 AOA
        minTerm: 6,
        maxTerm: 18,
        interestRate: '10.00', // 10% ao ano
        effortRate: '30.00', // Taxa de esforço máxima 30% (condições preferenciais)
        processingFee: '1.50', // Taxa de processamento reduzida 1,5%
        isActive: true,
        requirements: JSON.stringify([
          'Idade entre 18 e 35 anos',
          'Formação ou experiência agrícola',
          'Projeto inovador e sustentável',
          'Residência na zona rural',
        ]),
        benefits: JSON.stringify([
          'Taxa de juro reduzida',
          'Mentoria empresarial',
          'Acesso a tecnologias modernas',
          'Rede de contactos comerciais',
          'Formação em gestão agrícola',
        ]),
      },
      {
        financialInstitutionId: financialInstitution.id,
        name: 'Horticultura Comercial',
        description:
          'Financiamento para projetos de horticultura com foco na produção comercial e abastecimento dos mercados urbanos.',
        projectTypes: JSON.stringify(['horticulture']),
        minAmount: '150000.00', // 150.000 AOA
        maxAmount: '3000000.00', // 3.000.000 AOA
        minTerm: 6,
        maxTerm: 15,
        interestRate: '13.50', // 13,5% ao ano
        effortRate: '35.00', // Taxa de esforço máxima 35%
        processingFee: '2.00', // Taxa de processamento 2%
        isActive: true,
        requirements: JSON.stringify([
          'Acesso garantido à água',
          'Proximidade de mercados',
          'Conhecimento em horticultura',
          'Capacidade de escoamento da produção',
        ]),
        benefits: JSON.stringify([
          'Sementes certificadas subsidiadas',
          'Sistema de irrigação',
          'Apoio na comercialização',
          'Contratos de fornecimento',
        ]),
      },
      {
        financialInstitutionId: financialInstitution.id,
        name: 'Avicultura Moderna',
        description:
          'Programa para modernização e expansão de projetos avícolas, incluindo galinhas poedeiras e frangos de carne.',
        projectTypes: JSON.stringify(['poultry']),
        minAmount: '300000.00', // 300.000 AOA
        maxAmount: '4000000.00', // 4.000.000 AOA
        minTerm: 9,
        maxTerm: 24,
        interestRate: '14.00', // 14% ao ano
        effortRate: '38.00', // Taxa de esforço máxima 38%
        processingFee: '2.50', // Taxa de processamento 2,5%
        isActive: false, // Programa temporariamente suspenso
        requirements: JSON.stringify([
          'Instalações adequadas',
          'Conhecimento técnico avícola',
          'Plano sanitário aprovado',
          'Mercado definido para escoamento',
        ]),
        benefits: JSON.stringify([
          'Aves de raça melhorada',
          'Ração balanceada',
          'Assistência veterinária',
          'Equipamentos modernos',
        ]),
      },
    ];

    // Criar os programas de crédito
    let createdCount = 0;
    for (const program of samplePrograms) {
      const [existing] = await db
        .select()
        .from(creditPrograms)
        .where(eq(creditPrograms.name, program.name))
        .limit(1);

      if (!existing) {
        await db.insert(creditPrograms).values(program);
        console.log(`  ✅ Criado programa: ${program.name}`);
        createdCount++;
      } else {
        console.log(`  ⏭️ Programa já existe: ${program.name}`);
      }
    }

    if (createdCount > 0) {
      console.log(
        `🎉 ${createdCount} programas de crédito criados com sucesso!`
      );
    } else {
      console.log('ℹ️ Todos os programas já existem na base de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao criar programas de crédito:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCreditPrograms()
    .then(() => {
      console.log('Seed de programas de crédito executado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erro no seed de programas de crédito:', error);
      process.exit(1);
    });
}
