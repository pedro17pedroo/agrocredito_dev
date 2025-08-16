#!/usr/bin/env node

/**
 * Script de deploy da aplicação AgroCrédito
 * Compatível com Windows, macOS e Linux
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { config } from 'dotenv';

config();

// Configurações de deploy
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'production';
const APP_NAME = 'agrocredito';
const DOCKER_IMAGE = `${APP_NAME}:latest`;

console.log(`🚀 Iniciando deploy da aplicação AgroCrédito (${DEPLOY_ENV})...`);

// Função para executar comandos com log
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído`);
  } catch (error) {
    console.error(`❌ Erro em: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
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

// Função para verificar pré-requisitos
function checkPrerequisites() {
  console.log('🔍 Verificando pré-requisitos...');
  
  // Verificar Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch (error) {
    console.error('❌ Node.js não encontrado');
    process.exit(1);
  }

  // Verificar npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: v${npmVersion}`);
  } catch (error) {
    console.error('❌ npm não encontrado');
    process.exit(1);
  }

  // Verificar Docker
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Docker: ${dockerVersion}`);
  } catch (error) {
    console.error('❌ Docker não encontrado');
    process.exit(1);
  }

  // Verificar Docker Compose
  try {
    const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Docker Compose: ${composeVersion}`);
  } catch (error) {
    console.error('❌ Docker Compose não encontrado');
    process.exit(1);
  }

  // Verificar arquivo .env
  if (!fs.existsSync('.env')) {
    console.error('❌ Arquivo .env não encontrado');
    console.log('💡 Copie o .env.example para .env e configure as variáveis');
    process.exit(1);
  }
  console.log('✅ Arquivo .env encontrado');
}

// Função para fazer backup antes do deploy
function createBackup() {
  console.log('\n💾 Criando backup antes do deploy...');
  try {
    execSync('node scripts/backup.js', { stdio: 'inherit' });
    console.log('✅ Backup criado com sucesso');
  } catch (error) {
    console.warn('⚠️ Erro ao criar backup:', error.message);
    console.log('⚠️ Continuando sem backup...');
  }
}

// Função para build da aplicação
function buildApplication() {
  runCommand('npm ci --production=false', 'Instalação de dependências');
  runCommand('npm run check', 'Verificação de tipos TypeScript');
  runCommand('npm run build', 'Build da aplicação');
}

// Função para deploy com Docker
function deployWithDocker() {
  console.log('\n🐳 Deploy com Docker...');
  
  // Parar containers existentes
  try {
    execSync('docker-compose down', { stdio: 'pipe' });
    console.log('✅ Containers anteriores parados');
  } catch (error) {
    console.log('ℹ️ Nenhum container anterior encontrado');
  }

  // Build e start dos containers
  runCommand('docker-compose up -d --build', 'Build e start dos containers');
  
  // Aguardar containers iniciarem
  console.log('⏳ Aguardando containers iniciarem...');
  setTimeout(() => {
    try {
      execSync('docker-compose ps', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️ Erro ao verificar status dos containers');
    }
  }, 5000);
}

// Função para executar migrações
function runMigrations() {
  console.log('\n🗄️ Executando migrações da base de dados...');
  try {
    execSync('docker-compose exec -T app npm run db:push', { stdio: 'inherit' });
    console.log('✅ Migrações executadas');
  } catch (error) {
    console.warn('⚠️ Erro nas migrações:', error.message);
    console.log('💡 Verifique a configuração da base de dados');
  }
}

// Função para verificar saúde da aplicação
function healthCheck() {
  console.log('\n🏥 Verificando saúde da aplicação...');
  
  let attempts = 0;
  const maxAttempts = 10;
  
  const checkHealth = () => {
    attempts++;
    try {
      execSync('npm run health', { stdio: 'pipe' });
      console.log('✅ Aplicação está saudável');
      return true;
    } catch (error) {
      if (attempts < maxAttempts) {
        console.log(`⏳ Tentativa ${attempts}/${maxAttempts} - Aguardando aplicação...`);
        setTimeout(checkHealth, 3000);
      } else {
        console.error('❌ Aplicação não respondeu após múltiplas tentativas');
        console.log('💡 Verifique os logs: docker-compose logs');
        return false;
      }
    }
  };
  
  return checkHealth();
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const skipConfirmation = args.includes('--yes') || args.includes('-y');
  const skipBackup = args.includes('--no-backup');
  const skipHealthCheck = args.includes('--no-health-check');
  
  console.log(`\n🎯 Ambiente: ${DEPLOY_ENV}`);
  console.log(`📦 Imagem Docker: ${DOCKER_IMAGE}`);
  
  if (!skipConfirmation) {
    const confirmed = await askConfirmation(`\nTem certeza que deseja fazer deploy para ${DEPLOY_ENV}? (s/N): `);
    if (!confirmed) {
      console.log('❌ Deploy cancelado pelo utilizador.');
      process.exit(0);
    }
  }

  // Executar etapas do deploy
  checkPrerequisites();
  
  if (!skipBackup) {
    createBackup();
  }
  
  buildApplication();
  deployWithDocker();
  runMigrations();
  
  if (!skipHealthCheck) {
    healthCheck();
  }

  console.log('\n🎉 Deploy concluído com sucesso!');
  console.log('\n📋 Informações úteis:');
  console.log('🌐 URL da aplicação: http://localhost:5001');
  console.log('📊 Logs: docker-compose logs -f');
  console.log('🔍 Status: docker-compose ps');
  console.log('🛑 Parar: docker-compose down');
  
  if (DEPLOY_ENV === 'production') {
    console.log('\n⚠️ PRODUÇÃO: Verifique se todos os serviços estão funcionando corretamente!');
  }
}

// Executar função principal
main().catch(error => {
  console.error('❌ Erro inesperado no deploy:', error.message);
  process.exit(1);
});