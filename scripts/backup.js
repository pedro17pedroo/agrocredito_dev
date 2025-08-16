#!/usr/bin/env node

/**
 * Script de backup da base de dados AgroCrédito
 * Compatível com Windows, macOS e Linux
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config();

// Configurações da base de dados
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'agrocredito';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

// Configurações do backup
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const BACKUP_FILE = path.join(BACKUP_DIR, `agrocredito_backup_${timestamp}.sql`);

console.log('🗄️ Iniciando backup da base de dados AgroCrédito...');

// Verificar se a pasta de backups existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Pasta de backups criada');
}

// Verificar se o mysqldump está disponível
try {
  execSync('mysqldump --version', { stdio: 'pipe' });
  console.log('✅ mysqldump detectado');
} catch (error) {
  console.error('❌ mysqldump não encontrado. Por favor, instale o MySQL Client.');
  process.exit(1);
}

// Executar o backup
try {
  console.log(`📦 Criando backup em: ${BACKUP_FILE}`);
  
  const mysqldumpCmd = [
    'mysqldump',
    `--host=${DB_HOST}`,
    `--port=${DB_PORT}`,
    `--user=${DB_USER}`,
    DB_PASSWORD ? `--password=${DB_PASSWORD}` : '',
    '--single-transaction',
    '--routines',
    '--triggers',
    '--add-drop-table',
    '--extended-insert',
    '--create-options',
    '--quick',
    '--lock-tables=false',
    DB_NAME
  ].filter(Boolean).join(' ');

  const backupData = execSync(mysqldumpCmd, { encoding: 'utf8' });
  fs.writeFileSync(BACKUP_FILE, backupData);
  
  const stats = fs.statSync(BACKUP_FILE);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Backup criado com sucesso!`);
  console.log(`📁 Localização: ${BACKUP_FILE}`);
  console.log(`📊 Tamanho: ${fileSizeInMB} MB`);
  console.log(`🕒 Data/Hora: ${new Date().toLocaleString('pt-AO')}`);
  
} catch (error) {
  console.error('❌ Erro ao criar backup:', error.message);
  
  // Tentar backup via Docker se o comando direto falhar
  console.log('🐳 Tentando backup via Docker...');
  
  try {
    const dockerCmd = [
      'docker exec',
      'agrocredito-db-simple',
      'mysqldump',
      `--user=${DB_USER}`,
      DB_PASSWORD ? `--password=${DB_PASSWORD}` : '',
      '--single-transaction',
      '--routines',
      '--triggers',
      DB_NAME
    ].filter(Boolean).join(' ');
    
    const backupData = execSync(dockerCmd, { encoding: 'utf8' });
    fs.writeFileSync(BACKUP_FILE, backupData);
    
    const stats = fs.statSync(BACKUP_FILE);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup via Docker criado com sucesso!`);
    console.log(`📁 Localização: ${BACKUP_FILE}`);
    console.log(`📊 Tamanho: ${fileSizeInMB} MB`);
    
  } catch (dockerError) {
    console.error('❌ Erro no backup via Docker:', dockerError.message);
    console.error('💡 Verifique se o container MySQL está a correr: docker ps');
    process.exit(1);
  }
}

// Limpeza de backups antigos (manter apenas os últimos 10)
try {
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('agrocredito_backup_') && file.endsWith('.sql'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  if (backupFiles.length > 10) {
    const filesToDelete = backupFiles.slice(10);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️ Backup antigo removido: ${file.name}`);
    });
  }
  
  console.log(`📋 Total de backups mantidos: ${Math.min(backupFiles.length, 10)}`);
  
} catch (error) {
  console.warn('⚠️ Erro na limpeza de backups antigos:', error.message);
}

console.log('\n🎉 Processo de backup concluído!');