#!/usr/bin/env node

/**
 * Script de configuração inicial do AgroCrédito
 * Compatível com Windows, macOS e Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando o ambiente AgroCrédito...');

// Verificar se o Node.js está instalado
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js detectado: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.');
  process.exit(1);
}

// Verificar se o npm está instalado
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm detectado: v${npmVersion}`);
} catch (error) {
  console.error('❌ npm não encontrado. Por favor, instale o npm primeiro.');
  process.exit(1);
}

// Verificar se o Docker está instalado
try {
  const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Docker detectado: ${dockerVersion}`);
} catch (error) {
  console.warn('⚠️ Docker não encontrado. Algumas funcionalidades podem não funcionar.');
}

// Verificar se o Docker Compose está instalado
try {
  const dockerComposeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Docker Compose detectado: ${dockerComposeVersion}`);
} catch (error) {
  console.warn('⚠️ Docker Compose não encontrado. Algumas funcionalidades podem não funcionar.');
}

// Criar arquivo .env se não existir
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado a partir do .env.example');
  } else {
    console.warn('⚠️ Arquivo .env.example não encontrado. Crie manualmente o arquivo .env');
  }
} else {
  console.log('✅ Arquivo .env já existe');
}

// Instalar dependências
console.log('📦 Instalando dependências...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas com sucesso');
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

// Verificar se as pastas necessárias existem
const requiredDirs = ['uploads', 'logs', 'backups'];
requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Pasta ${dir} criada`);
  } else {
    console.log(`✅ Pasta ${dir} já existe`);
  }
});

console.log('\n🎉 Configuração concluída com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no arquivo .env');
console.log('2. Execute "npm run docker:dev" para iniciar com Docker');
console.log('3. Ou execute "npm run dev" para desenvolvimento local');
console.log('\n🌐 A aplicação estará disponível em: http://localhost:5001');