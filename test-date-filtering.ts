import { db } from "./server/db.js";
import { creditApplications } from "./shared/schema.js";
import { parseISO, endOfMonth } from 'date-fns';

async function testDateFiltering() {
  try {
    const apps = await db.select().from(creditApplications);
    console.log('Total de aplicações na BD:', apps.length);
    
    // Simular a mesma filtragem da página de relatórios
    const dateRange = {
      from: new Date('2020-01-01'),
      to: endOfMonth(new Date())
    };
    
    console.log('\nRange de datas usado na filtragem:');
    console.log('From:', dateRange.from);
    console.log('To:', dateRange.to);
    
    // Primeiro, vamos ver o formato das datas
    console.log('\n=== FORMATO DAS DATAS ===');
    apps.slice(0, 3).forEach(app => {
      console.log(`App: ${app.projectName}`);
      console.log(`  createdAt raw:`, app.createdAt);
      console.log(`  createdAt type:`, typeof app.createdAt);
      console.log(`  createdAt toString():`, app.createdAt?.toString());
      console.log(`  parseISO result:`, parseISO(app.createdAt?.toString() || ''));
      console.log(`  new Date result:`, new Date(app.createdAt || ''));
      console.log('---');
    });
    
    const filteredApps = apps.filter(app => {
      if (!app.createdAt) {
        console.log(`❌ App "${app.projectName}" - SEM createdAt`);
        return false;
      }
      
      // Tentar diferentes formas de parsing
      let parsedDate;
      try {
        // Primeiro tentar com new Date diretamente
        parsedDate = new Date(app.createdAt);
        if (isNaN(parsedDate.getTime())) {
          // Se falhar, tentar parseISO
          parsedDate = parseISO(app.createdAt.toString());
        }
      } catch (e) {
        console.log(`❌ App "${app.projectName}" - ERRO AO PARSEAR DATA: ${e}`);
        return false;
      }
      
      const isInRange = parsedDate >= dateRange.from && parsedDate <= dateRange.to;
      
      if (!isInRange) {
        console.log(`❌ App "${app.projectName}" - Data: ${parsedDate} - FORA DO RANGE`);
      } else {
        console.log(`✅ App "${app.projectName}" - Data: ${parsedDate} - DENTRO DO RANGE`);
      }
      
      return isInRange;
    });
    
    console.log('\n=== RESULTADO ===');
    console.log('Total original:', apps.length);
    console.log('Após filtragem:', filteredApps.length);
    console.log('Diferença:', apps.length - filteredApps.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

testDateFiltering();