import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

// Configurações da base de dados
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'agrocredito_dev';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '2003';

console.log('🔍 Debug do Sistema AgroCrédito (Windows)');
console.log('=' .repeat(50));

async function debugSystem() {
  try {
    // 1. Verificar variáveis de ambiente
    console.log('\n📋 Variáveis de Ambiente:');
    console.log(`   DB_HOST: ${DB_HOST}`);
    console.log(`   DB_PORT: ${DB_PORT}`);
    console.log(`   DB_NAME: ${DB_NAME}`);
    console.log(`   DB_USER: ${DB_USER}`);
    console.log(`   DB_PASSWORD: ${DB_PASSWORD ? '[DEFINIDA]' : '[NÃO DEFINIDA]'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '[DEFINIDA]' : '[NÃO DEFINIDA]'}`);
    
    // 2. Testar conexão MySQL direta
    console.log('\n🔗 Testando Conexão MySQL Direta...');
    let connection: mysql.Connection;
    
    try {
      connection = await mysql.createConnection({
        host: DB_HOST,
        port: parseInt(DB_PORT),
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
      });
      console.log('   ✅ Conexão MySQL direta: SUCESSO');
      
      // Testar query simples
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('   ✅ Query de teste: SUCESSO');
      
      // Verificar tabelas existentes
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`   📊 Tabelas encontradas: ${(tables as any[]).length}`);
      
      if ((tables as any[]).length > 0) {
        console.log('   📋 Lista de tabelas:');
        (tables as any[]).forEach((table: any) => {
          const tableName = Object.values(table)[0];
          console.log(`      - ${tableName}`);
        });
      }
      
      await connection.end();
    } catch (error: any) {
      console.log('   ❌ Conexão MySQL direta: FALHOU');
      console.log(`   💥 Erro: ${error.message}`);
      return;
    }
    
    // 3. Testar conexão Drizzle
    console.log('\n🔗 Testando Conexão Drizzle...');
    try {
      // Verificar se DATABASE_URL está definida
      if (!process.env.DATABASE_URL) {
        console.log('   ❌ DATABASE_URL não definida - Drizzle não pode ser testado');
        console.log('   💡 Defina DATABASE_URL no .env ou execute: npm run create:db:win');
      } else {
        // Importar db apenas se DATABASE_URL estiver definida
        const { db } = await import('../server/db');
        const { users, profiles, permissions } = await import('../shared/schema');
        
        // Testar query com Drizzle
        const userCount = await db.select().from(users).limit(1);
        console.log('   ✅ Conexão Drizzle: SUCESSO');
        
        // Verificar dados existentes
        const [userCountResult] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [profileCountResult] = await db.execute('SELECT COUNT(*) as count FROM profiles');
        const [permissionCountResult] = await db.execute('SELECT COUNT(*) as count FROM permissions');
        
        console.log(`   👥 Utilizadores: ${(userCountResult as any).count}`);
        console.log(`   👤 Perfis: ${(profileCountResult as any).count}`);
        console.log(`   🔐 Permissões: ${(permissionCountResult as any).count}`);
      }
    } catch (error: any) {
      console.log('   ❌ Conexão Drizzle: FALHOU');
      console.log(`   💥 Erro: ${error.message}`);
      console.log(`   📍 Stack: ${error.stack?.split('\n')[1] || 'N/A'}`);
    }
    
    // 4. Verificar estrutura de ficheiros
    console.log('\n📁 Verificando Estrutura de Ficheiros...');
    const fs = await import('fs');
    const path = await import('path');
    
    const filesToCheck = [
      '.env',
      'shared/schema.ts',
      'server/db.ts',
      'scripts/seed.ts',
      'scripts/restore-windows.ts',
      'backups/'
    ];
    
    filesToCheck.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      const exists = fs.existsSync(fullPath);
      console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
    
    // 5. Verificar backups disponíveis
    console.log('\n💾 Verificando Backups...');
    const backupDir = path.join(process.cwd(), 'backups');
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'));
      
      console.log(`   📊 Backups encontrados: ${backupFiles.length}`);
      backupFiles.forEach(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        const size = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`      - ${file} (${size} MB)`);
      });
    } else {
      console.log('   ❌ Pasta de backups não encontrada');
    }
    
    console.log('\n🎉 Debug concluído!');
    console.log('\n💡 Sugestões:');
    console.log('   1. Se a conexão MySQL falhou, verifique se o MySQL está a correr');
    console.log('   2. Se a base de dados não existe, execute: npm run create:db:win');
    console.log('   3. Se a conexão Drizzle falhou, execute: npm run db:migrate');
    console.log('   4. Para seeds: npm run db:seed-all:win');
    console.log('   5. Para restore: npm run restore:win:v2:force');
    
  } catch (error: any) {
    console.error('❌ Erro no debug:', error.message);
    console.error('📍 Stack:', error.stack);
  }
}

// Executar debug
if (import.meta.url === `file://${process.argv[1]}`) {
  debugSystem()
    .then(() => {
      console.log('\n✅ Debug finalizado!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro no debug:', error);
      process.exit(1);
    });
}

export { debugSystem };