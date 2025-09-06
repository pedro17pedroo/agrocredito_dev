import { db } from './db.js';
import { creditApplications } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkApplicationsStatus() {
  console.log('🔍 Verificando status das aplicações na base de dados...');
  
  try {
    // Buscar todas as aplicações
    const allApps = await db.select().from(creditApplications);
    console.log('📊 Total de aplicações na BD:', allApps.length);
    
    // Contar por status
    const statusCounts = {
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0
    };
    
    allApps.forEach(app => {
      if (app.status && statusCounts.hasOwnProperty(app.status)) {
        statusCounts[app.status as keyof typeof statusCounts]++;
      } else {
        console.log('⚠️ Status desconhecido encontrado:', app.status);
      }
    });
    
    console.log('📈 Contagem por status:');
    console.log('  - Pendentes:', statusCounts.pending);
    console.log('  - Em análise:', statusCounts.under_review);
    console.log('  - Aprovadas:', statusCounts.approved);
    console.log('  - Rejeitadas:', statusCounts.rejected);
    
    // Mostrar detalhes das aplicações pendentes
    console.log('\n🔍 Detalhes das aplicações pendentes:');
    const pendingApps = allApps.filter(app => app.status === 'pending');
    pendingApps.forEach((app, index) => {
      console.log(`  ${index + 1}. ID: ${app.id}, Projeto: ${app.projectName}, Criado em: ${app.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar aplicações:', error);
  }
  
  process.exit(0);
}

checkApplicationsStatus();