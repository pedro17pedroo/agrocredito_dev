import { config } from 'dotenv';
config();

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando conexão com a base de dados...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');
    
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Conexão com a base de dados bem-sucedida!');
    console.log('📋 Resultado do teste:', result);
    
    // Test if tables exist
    const tables = await db.execute(sql`SHOW TABLES`);
    const tableCount = Array.isArray(tables) ? tables.length : 0;
    console.log('📊 Tabelas encontradas:', tableCount);
    
    if (tableCount === 0) {
      console.log('⚠️ Nenhuma tabela encontrada. Execute primeiro: npm run db:push');
    } else {
      console.log('📋 Lista de tabelas:');
      if (Array.isArray(tables)) {
        tables.forEach((table: any, index: number) => {
          const tableName = Object.values(table)[0];
          console.log(`  ${index + 1}. ${tableName}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão com a base de dados:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 Dica: Verifique se o MySQL está a executar');
        console.log('🐳 Para Docker: npm run docker:dev');
      } else if (error.message.includes('Access denied')) {
        console.log('💡 Dica: Verifique as credenciais no arquivo .env');
      } else if (error.message.includes('Unknown database')) {
        console.log('💡 Dica: A base de dados não existe. Crie-a primeiro.');
      }
    }
    
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection()
    .then(() => {
      console.log('🎉 Teste de conexão concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Teste de conexão falhou:', error.message);
      process.exit(1);
    });
}

export { testDatabaseConnection };