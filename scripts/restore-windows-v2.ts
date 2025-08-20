import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Configurações da base de dados
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'agrocredito_dev';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '2003';

// Configurações do restore
const BACKUP_DIR = path.join(process.cwd(), 'backups');

console.log('🔄 Iniciando restauro da base de dados AgroCrédito (Windows v2)...');

interface BackupFile {
  name: string;
  path: string;
  size: string;
  date: string;
}

// Função para listar backups disponíveis
function listBackups(): BackupFile[] {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ Pasta de backups não encontrada.');
    process.exit(1);
  }

  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('agrocredito_backup_') && file.endsWith('.sql'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: (stats.size / (1024 * 1024)).toFixed(2),
        date: stats.mtime.toLocaleString('pt-PT')
      };
    })
    .sort((a, b) => {
      const aTime = fs.statSync(a.path).mtime.getTime();
      const bTime = fs.statSync(b.path).mtime.getTime();
      return bTime - aTime;
    });

  if (backupFiles.length === 0) {
    console.error('❌ Nenhum backup encontrado na pasta backups/');
    process.exit(1);
  }

  return backupFiles;
}

// Função para pedir confirmação (compatível com Windows)
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n' + question);
    console.log('💡 Digite "s" ou "sim" para confirmar, qualquer outra tecla para cancelar.');
    console.log('⚠️ Pressione ENTER após digitar sua resposta.');
    
    rl.question('\n> ', (answer) => {
      rl.close();
      const confirmed = answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
      console.log(`\n📝 Resposta recebida: "${answer}" -> ${confirmed ? 'CONFIRMADO' : 'CANCELADO'}`);
      resolve(confirmed);
    });
  });
}

// Função para executar comandos SQL
async function executeSqlCommands(connection: mysql.Connection, sqlContent: string) {
  console.log('🔍 Analisando conteúdo SQL...');
  
  // Dividir o conteúdo SQL em comandos individuais
  const commands = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

  console.log(`📊 Executando ${commands.length} comandos SQL...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    try {
      await connection.execute(command);
      successCount++;
      
      // Mostrar progresso a cada 10 comandos
      if (successCount % 10 === 0) {
        console.log(`⏳ Progresso: ${successCount}/${commands.length} comandos executados`);
      }
    } catch (error: any) {
      // Ignorar alguns erros comuns que não são críticos
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
          error.code === 'ER_DUP_KEYNAME' ||
          error.message.includes('already exists')) {
        // Erro não crítico, continuar
        continue;
      }
      
      errorCount++;
      console.warn(`⚠️ Erro no comando ${i + 1} (ignorado): ${error.message}`);
      
      // Se houver muitos erros, parar
      if (errorCount > 10) {
        throw new Error(`Muitos erros durante o restore (${errorCount}). Parando execução.`);
      }
    }
  }

  console.log(`✅ Restore concluído: ${successCount} comandos executados com sucesso`);
  if (errorCount > 0) {
    console.log(`⚠️ ${errorCount} comandos com erros (ignorados)`);
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando função main...');
    const args = process.argv.slice(2);
    console.log(`📋 Argumentos recebidos: ${args.length > 0 ? args.join(', ') : 'nenhum'}`);
    
    let backupFile: string;

    if (args.length > 0 && !args[0].startsWith('--')) {
      console.log('📁 Modo: arquivo especificado como argumento');
      // Arquivo especificado como argumento
      const argFile = args[0];
      if (!argFile) {
        console.error('❌ Argumento de arquivo inválido.');
        process.exit(1);
      }
      backupFile = argFile;
      if (!path.isAbsolute(backupFile)) {
        backupFile = path.join(BACKUP_DIR, backupFile);
      }
      
      if (!fs.existsSync(backupFile)) {
        console.error(`❌ Arquivo de backup não encontrado: ${backupFile}`);
        process.exit(1);
      }
    } else {
      console.log('📁 Modo: selecionar backup mais recente automaticamente');
      // Listar backups disponíveis
      const backups = listBackups();
      
      console.log('\n📋 Backups disponíveis:');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name}`);
        console.log(`   📊 Tamanho: ${backup.size} MB`);
        console.log(`   🕒 Data: ${backup.date}\n`);
      });
      
      // Usar o backup mais recente por padrão
      backupFile = backups[0].path;
      console.log(`🎯 Backup mais recente selecionado: ${backups[0].name}`);
    }

    console.log(`📄 Arquivo de backup selecionado: ${path.basename(backupFile)}`);
    
    // Verificar se é execução automática (com argumento --force)
    const forceMode = args.includes('--force') || process.env.RESTORE_FORCE === 'true';
    console.log(`🔧 Modo força: ${forceMode ? 'ATIVADO' : 'DESATIVADO'}`);
    
    if (!forceMode) {
      console.log('❓ Solicitando confirmação do utilizador...');
      // Confirmar ação
      const confirmed = await askConfirmation(`⚠️ ATENÇÃO: Esta ação irá substituir todos os dados atuais da base de dados '${DB_NAME}'. Tem certeza que deseja continuar?`);
      
      if (!confirmed) {
        console.log('❌ Operação cancelada pelo utilizador.');
        process.exit(0);
      }
    } else {
      console.log('🚀 Modo automático ativado (--force). Prosseguindo sem confirmação...');
    }
    
    console.log('🔄 Prosseguindo para conexão com a base de dados...');

    // Criar conexão com a base de dados
    let connection: mysql.Connection;
    
    try {
      console.log('🔗 Conectando à base de dados...');
      console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
      console.log(`   Database: ${DB_NAME}`);
      console.log(`   User: ${DB_USER}`);
      
      connection = await mysql.createConnection({
        host: DB_HOST,
        port: parseInt(DB_PORT),
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        multipleStatements: true
      });
      console.log('✅ Conexão estabelecida com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao conectar à base de dados:', error.message);
      console.error('💡 Verifique se:');
      console.error('   - O MySQL está a correr');
      console.error('   - As credenciais no .env estão corretas');
      console.error('   - A base de dados existe');
      console.error('\n🔧 Para debug, execute: npm run debug:win');
      process.exit(1);
    }

    // Executar o restore
    try {
      console.log(`\n🔄 Restaurando backup: ${path.basename(backupFile)}`);
      
      // Ler o arquivo de backup
      console.log('📖 Lendo arquivo de backup...');
      const backupData = fs.readFileSync(backupFile, 'utf8');
      console.log(`📁 Arquivo lido: ${(backupData.length / 1024).toFixed(2)} KB`);
      
      // Executar comandos SQL
      await executeSqlCommands(connection, backupData);
      
      console.log('\n✅ Restore concluído com sucesso!');
      console.log(`📁 Backup restaurado: ${path.basename(backupFile)}`);
      console.log(`🕒 Data/Hora: ${new Date().toLocaleString('pt-PT')}`);
      
    } catch (error: any) {
      console.error('❌ Erro ao restaurar backup:', error.message);
      console.error('📍 Stack:', error.stack);
      process.exit(1);
    } finally {
      // Fechar conexão
      if (connection) {
        await connection.end();
        console.log('🔌 Conexão fechada.');
      }
    }

    console.log('\n🎉 Processo de restore concluído!');
    console.log('💡 Pode agora aceder à aplicação com os dados restaurados.');
    console.log('🔧 Para executar seeds: npm run db:seed-all:win');
    
  } catch (error: any) {
    console.error('❌ Erro inesperado na função main:', error.message);
    console.error('📍 Stack:', error.stack);
    process.exit(1);
  }
}

// Executar função principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Erro inesperado:', error.message);
    console.error('📍 Stack:', error.stack);
    process.exit(1);
  });
}

export { main as restoreDatabase };