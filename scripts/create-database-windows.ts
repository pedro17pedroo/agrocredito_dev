import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

// Configurações da base de dados
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'agrocredito_dev';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';

console.log('🏗️ Criando Base de Dados AgroCrédito (Windows)');
console.log('=' .repeat(50));

async function createDatabase() {
  let connection: mysql.Connection | undefined;
  
  try {
    console.log('\n🔗 Conectando ao MySQL...');
    console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
    console.log(`   Utilizador: ${DB_USER}`);
    console.log(`   Password: ${DB_PASSWORD ? '[DEFINIDA]' : '[NÃO DEFINIDA]'}`);
    
    // Conectar sem especificar a base de dados
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se a base de dados já existe
    console.log(`\n🔍 Verificando se a base de dados '${DB_NAME}' existe...`);
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = (databases as any[]).some((db: any) => 
      Object.values(db)[0] === DB_NAME
    );
    
    if (dbExists) {
      console.log(`✅ Base de dados '${DB_NAME}' já existe!`);
    } else {
      console.log(`⚠️ Base de dados '${DB_NAME}' não existe. Criando...`);
      
      // Criar a base de dados
      await connection.execute(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Base de dados '${DB_NAME}' criada com sucesso!`);
    }
    
    // Verificar se conseguimos usar a base de dados
    await connection.execute(`USE \`${DB_NAME}\``);
    console.log(`✅ Base de dados '${DB_NAME}' está acessível!`);
    
    console.log('\n🎉 Processo concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Execute: npm run db:migrate');
    console.log('   2. Execute: npm run db:seed-all:win');
    
  } catch (error: any) {
    console.error('❌ Erro ao criar base de dados:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Sugestões para resolver erro de acesso:');
      console.error('   1. Verifique se o MySQL está a correr');
      console.error('   2. Verifique as credenciais no ficheiro .env');
      console.error('   3. Tente: mysql -u root -p (para testar login manual)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugestões para resolver erro de conexão:');
      console.error('   1. Inicie o MySQL: net start mysql (como administrador)');
      console.error('   2. Ou use XAMPP/WAMP se instalado');
      console.error('   3. Verifique se a porta 3306 está livre');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada.');
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createDatabase()
    .then(() => {
      console.log('\n✅ Script finalizado!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro no script:', error);
      process.exit(1);
    });
}

export { createDatabase };