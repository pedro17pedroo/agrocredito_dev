#!/usr/bin/env node

/**
 * Script de restauro da base de dados AgroCrédito
 * Compatível com Windows, macOS e Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

// Configurações da base de dados
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'agrocredito';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

// Configurações do restore
const BACKUP_DIR = path.join(process.cwd(), 'backups');

console.log('🔄 Iniciando restauro da base de dados AgroCrédito...');

// Função para listar backups disponíveis
function listBackups() {
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
        date: stats.mtime.toLocaleString('pt-AO')
      };
    })
    .sort((a, b) => fs.statSync(b.path).mtime - fs.statSync(a.path).mtime);

  if (backupFiles.length === 0) {
    console.error('❌ Nenhum backup encontrado na pasta backups/');
    process.exit(1);
  }

  return backupFiles;
}

// Função para confirmar ação
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
    });
  });
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  let backupFile;

  if (args.length > 0) {
    // Arquivo especificado como argumento
    backupFile = args[0];
    if (!path.isAbsolute(backupFile)) {
      backupFile = path.join(BACKUP_DIR, backupFile);
    }
    
    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Arquivo de backup não encontrado: ${backupFile}`);
      process.exit(1);
    }
  } else {
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

  // Confirmar ação
  console.log(`\n⚠️ ATENÇÃO: Esta ação irá substituir todos os dados atuais da base de dados '${DB_NAME}'.`);
  const confirmed = await askConfirmation('Tem certeza que deseja continuar? (s/N): ');
  
  if (!confirmed) {
    console.log('❌ Operação cancelada pelo utilizador.');
    process.exit(0);
  }

  // Verificar se o mysql está disponível
  try {
    execSync('mysql --version', { stdio: 'pipe' });
    console.log('✅ mysql client detectado');
  } catch (error) {
    console.error('❌ mysql client não encontrado. Por favor, instale o MySQL Client.');
    process.exit(1);
  }

  // Executar o restore
  try {
    console.log(`\n🔄 Restaurando backup: ${path.basename(backupFile)}`);
    
    const mysqlCmd = [
      'mysql',
      `--host=${DB_HOST}`,
      `--port=${DB_PORT}`,
      `--user=${DB_USER}`,
      DB_PASSWORD ? `--password=${DB_PASSWORD}` : '',
      DB_NAME
    ].filter(Boolean).join(' ');

    const backupData = fs.readFileSync(backupFile, 'utf8');
    
    // Executar o restore
    execSync(`echo "${backupData.replace(/"/g, '\\"')}" | ${mysqlCmd}`, { stdio: 'pipe' });
    
    console.log('✅ Restore concluído com sucesso!');
    console.log(`📁 Backup restaurado: ${path.basename(backupFile)}`);
    console.log(`🕒 Data/Hora: ${new Date().toLocaleString('pt-AO')}`);
    
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error.message);
    
    // Tentar restore via Docker se o comando direto falhar
    console.log('🐳 Tentando restore via Docker...');
    
    try {
      const backupData = fs.readFileSync(backupFile, 'utf8');
      
      // Criar arquivo temporário no container
      const tempFile = '/tmp/restore_backup.sql';
      execSync(`docker exec -i agrocredito-mysql sh -c 'cat > ${tempFile}'`, { 
        input: backupData,
        stdio: 'pipe'
      });
      
      // Executar restore no container
      const dockerCmd = [
        'docker exec',
        'agrocredito-mysql',
        'mysql',
        `--user=${DB_USER}`,
        DB_PASSWORD ? `--password=${DB_PASSWORD}` : '',
        DB_NAME,
        '<',
        tempFile
      ].filter(Boolean).join(' ');
      
      execSync(dockerCmd, { stdio: 'pipe' });
      
      // Limpar arquivo temporário
      execSync(`docker exec agrocredito-mysql rm ${tempFile}`, { stdio: 'pipe' });
      
      console.log('✅ Restore via Docker concluído com sucesso!');
      console.log(`📁 Backup restaurado: ${path.basename(backupFile)}`);
      
    } catch (dockerError) {
      console.error('❌ Erro no restore via Docker:', dockerError.message);
      console.error('💡 Verifique se o container MySQL está a correr: docker ps');
      process.exit(1);
    }
  }

  console.log('\n🎉 Processo de restore concluído!');
  console.log('💡 Pode agora aceder à aplicação com os dados restaurados.');
}

// Executar função principal
main().catch(error => {
  console.error('❌ Erro inesperado:', error.message);
  process.exit(1);
});