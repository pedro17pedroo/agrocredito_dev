import { db } from './server/db.js';
import { creditApplications } from './shared/schema.js';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

async function testReportsFiltering() {
  try {
    console.log('=== TESTE DA FILTRAGEM DE RELATÓRIOS ===');
    
    // Buscar todas as aplicações
    const apps = await db.select().from(creditApplications);
    console.log('Total de aplicações na BD:', apps.length);
    
    // Simular o mesmo período usado na página de relatórios (últimos 30 dias)
    const now = new Date();
    const dateRange = {
      from: startOfMonth(subMonths(now, 1)),
      to: endOfMonth(now)
    };
    
    console.log('Período de filtragem:');
    console.log('  De:', dateRange.from);
    console.log('  Até:', dateRange.to);
    
    // Aplicar a mesma filtragem da página de relatórios
    const filteredApps = apps.filter(app => {
      if (!app.createdAt) return false;
      
      // Usar new Date() como na correção
      const appDate = new Date(app.createdAt);
      return appDate >= dateRange.from && appDate <= dateRange.to;
    });
    
    console.log('\n=== RESULTADO ===');
    console.log('Aplicações filtradas:', filteredApps.length);
    console.log('Aplicações excluídas:', apps.length - filteredApps.length);
    
    // Mostrar algumas aplicações para debug
    console.log('\n=== PRIMEIRAS 5 APLICAÇÕES ===');
    apps.slice(0, 5).forEach((app, index) => {
      const appDate = new Date(app.createdAt || '');
      const isInRange = app.createdAt && appDate >= dateRange.from && appDate <= dateRange.to;
      console.log(`${index + 1}. ${app.projectName}`);
      console.log(`   Data: ${appDate}`);
      console.log(`   Incluída: ${isInRange ? 'SIM' : 'NÃO'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

testReportsFiltering();