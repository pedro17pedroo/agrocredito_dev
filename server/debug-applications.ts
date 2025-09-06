import { db } from './db';
import { creditApplications } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function debugApplications() {
  try {
    console.log('🔍 === VERIFICAÇÃO DA BASE DE DADOS ===');
    
    // Contar total de aplicações
    const totalCount = await db.select({ count: sql`COUNT(*)` }).from(creditApplications);
    console.log('📊 Total de aplicações na BD:', totalCount[0]?.count || 0);
    
    // Contar por status
    const statusCounts = await db.select({
      status: creditApplications.status,
      count: sql`COUNT(*)`
    })
    .from(creditApplications)
    .groupBy(creditApplications.status);
    
    console.log('📊 Contagem por status:');
    statusCounts.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    // Listar todas as aplicações com detalhes
    const allApplications = await db.select({
      id: creditApplications.id,
      status: creditApplications.status,
      projectName: creditApplications.projectName,
      amount: creditApplications.amount,
      createdAt: creditApplications.createdAt
    })
    .from(creditApplications)
    .orderBy(creditApplications.createdAt);
    
    console.log('📋 Lista completa de aplicações:');
    allApplications.forEach((app, index) => {
      console.log(`  ${index + 1}. ID: ${app.id} | Status: ${app.status} | Projeto: ${app.projectName} | Valor: ${app.amount} | Data: ${app.createdAt}`);
    });
    
    console.log('✅ Verificação concluída');
    
  } catch (error) {
    console.error('❌ Erro ao verificar aplicações:', error);
  } finally {
    process.exit(0);
  }
}

debugApplications();