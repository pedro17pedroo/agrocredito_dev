import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Configurações da base de dados
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'agrocredito_dev';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';

// Configurações do backup
const BACKUP_DIR = path.join(process.cwd(), 'backups');

console.log('💾 Iniciando backup da base de dados AgroCrédito (Windows)...');

// Função para criar diretório de backup se não existir
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Diretório de backup criado: ${BACKUP_DIR}`);
  }
}

// Função para gerar nome do arquivo de backup
function generateBackupFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  return `agrocredito_backup_${timestamp}.sql`;
}

// Função para obter estrutura das tabelas
async function getTableStructure(connection: mysql.Connection, tableName: string): Promise<string> {
  const [rows] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``) as any;
  const createStatement = rows[0]['Create Table'];
  return `--\n-- Estrutura da tabela \`${tableName}\`\n--\n\nDROP TABLE IF EXISTS \`${tableName}\`;\n${createStatement};\n\n`;
}

// Função para obter dados das tabelas
async function getTableData(connection: mysql.Connection, tableName: string): Promise<string> {
  const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``) as any;
  
  if (rows.length === 0) {
    return `--\n-- Dados da tabela \`${tableName}\`: tabela vazia\n--\n\n`;
  }

  let sql = `--\n-- Dados da tabela \`${tableName}\`\n--\n\n`;
  
  // Obter nomes das colunas
  const [columns] = await connection.execute(`SHOW COLUMNS FROM \`${tableName}\``) as any;
  const columnNames = columns.map((col: any) => col.Field as string);
  
  // Gerar INSERT statements
  const insertPrefix = `INSERT INTO \`${tableName}\` (${columnNames.map(name => `\`${name}\``).join(', ')}) VALUES`;
  
  const values = rows.map((row: any) => {
    const rowValues = columnNames.map((col: string) => {
      const value = row[col];
      if (value === null) return 'NULL';
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
      }
      if (value instanceof Date) {
        return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
      }
      return value;
    });
    return `(${rowValues.join(', ')})`;
  });
  
  // Dividir em chunks para evitar statements muito grandes
  const chunkSize = 100;
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    sql += `${insertPrefix}\n${chunk.join(',\n')};\n\n`;
  }
  
  return sql;
}

// Função principal
async function main() {
  // Garantir que o diretório de backup existe
  ensureBackupDir();
  
  // Gerar nome do arquivo
  const backupFilename = generateBackupFilename();
  const backupPath = path.join(BACKUP_DIR, backupFilename);
  
  console.log(`📁 Arquivo de backup: ${backupFilename}`);

  // Criar conexão com a base de dados
  let connection: mysql.Connection;
  
  try {
    console.log('🔗 Conectando à base de dados...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });
    console.log('✅ Conexão estabelecida com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao conectar à base de dados:', error.message);
    console.error('💡 Verifique se:');
    console.error('   - O MySQL está a correr');
    console.error('   - As credenciais no .env estão corretas');
    console.error('   - A base de dados existe');
    process.exit(1);
  }

  try {
    console.log('📊 Obtendo lista de tabelas...');
    
    // Obter lista de tabelas
    const [tables] = await connection.execute('SHOW TABLES') as any;
    const tableNames = tables.map((row: any) => Object.values(row)[0] as string);
    
    console.log(`📋 Encontradas ${tableNames.length} tabelas: ${tableNames.join(', ')}`);
    
    // Iniciar arquivo SQL
    let sqlContent = `-- MySQL dump gerado pelo AgroCrédito Backup (Windows)\n`;
    sqlContent += `-- Host: ${DB_HOST}    Database: ${DB_NAME}\n`;
    sqlContent += `-- ------------------------------------------------------\n`;
    sqlContent += `-- Data do backup: ${new Date().toLocaleString('pt-AO')}\n\n`;
    
    sqlContent += `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n`;
    sqlContent += `/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;\n`;
    sqlContent += `/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;\n`;
    sqlContent += `/*!50503 SET NAMES utf8mb4 */;\n`;
    sqlContent += `/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;\n`;
    sqlContent += `/*!40103 SET TIME_ZONE='+00:00' */;\n`;
    sqlContent += `/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;\n`;
    sqlContent += `/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;\n`;
    sqlContent += `/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;\n`;
    sqlContent += `/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;\n\n`;
    
    // Processar cada tabela
    for (const tableName of tableNames) {
      console.log(`📋 Processando tabela: ${tableName}`);
      
      // Adicionar estrutura da tabela
      sqlContent += await getTableStructure(connection, tableName);
      
      // Adicionar dados da tabela
      sqlContent += await getTableData(connection, tableName);
    }
    
    // Finalizar arquivo SQL
    sqlContent += `/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;\n`;
    sqlContent += `/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;\n`;
    sqlContent += `/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;\n`;
    sqlContent += `/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;\n`;
    sqlContent += `/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n`;
    sqlContent += `/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\n`;
    sqlContent += `/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;\n`;
    sqlContent += `/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;\n`;
    
    // Escrever arquivo
    console.log('💾 Escrevendo arquivo de backup...');
    fs.writeFileSync(backupPath, sqlContent, 'utf8');
    
    // Informações do backup
    const stats = fs.statSync(backupPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ Backup concluído com sucesso!');
    console.log(`📁 Arquivo: ${backupFilename}`);
    console.log(`📊 Tamanho: ${sizeInMB} MB`);
    console.log(`📋 Tabelas: ${tableNames.length}`);
    console.log(`🕒 Data/Hora: ${new Date().toLocaleString('pt-AO')}`);
    console.log(`📂 Localização: ${backupPath}`);
    
  } catch (error: any) {
    console.error('❌ Erro durante o backup:', error.message);
    process.exit(1);
  } finally {
    // Fechar conexão
    if (connection!) {
      await connection.end();
      console.log('🔌 Conexão fechada.');
    }
  }

  console.log('\n🎉 Processo de backup concluído!');
  console.log('💡 Use "npm run restore:win" para restaurar este backup.');
}

// Executar função principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  });
}

export { main as backupDatabase };