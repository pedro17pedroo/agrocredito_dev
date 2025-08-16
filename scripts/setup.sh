#!/bin/bash

# ==============================================
# SCRIPT DE CONFIGURAÇÃO INICIAL - AGROCREDITO
# ==============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado na raiz do projeto AgroCrédito"
    exit 1
fi

print_info "Iniciando configuração do AgroCrédito..."

# 1. Verificar dependências do sistema
print_info "Verificando dependências do sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Instale Node.js 18+ antes de continuar."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado"
    exit 1
fi
print_success "npm $(npm -v) encontrado"

# 2. Configurar ficheiro .env
print_info "Configurando ficheiro de ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Ficheiro .env criado a partir do .env.example"
    print_warning "IMPORTANTE: Edite o ficheiro .env com as suas configurações antes de continuar"
else
    print_warning "Ficheiro .env já existe. Verifique se está configurado corretamente."
fi

# 3. Instalar dependências
print_info "Instalando dependências do projeto..."
npm install
print_success "Dependências instaladas com sucesso"

# 4. Verificar MySQL
print_info "Verificando conexão com MySQL..."
if command -v mysql &> /dev/null; then
    print_success "MySQL encontrado"
    print_info "Certifique-se de que o MySQL está a correr e a base de dados está criada"
else
    print_warning "MySQL não encontrado no PATH. Certifique-se de que está instalado e a correr"
fi

# 5. Criar diretórios necessários
print_info "Criando diretórios necessários..."
mkdir -p uploads logs
print_success "Diretórios criados"

# 6. Verificar se Docker está disponível
if command -v docker &> /dev/null; then
    print_success "Docker encontrado - $(docker --version)"
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose encontrado - $(docker-compose --version)"
    else
        print_warning "Docker Compose não encontrado. Instale para usar a configuração Docker"
    fi
else
    print_warning "Docker não encontrado. Instale Docker para usar a configuração de containers"
fi

# 7. Instruções finais
print_info "Configuração inicial concluída!"
echo ""
print_info "Próximos passos:"
echo "1. Edite o ficheiro .env com as suas configurações"
echo "2. Configure a base de dados MySQL"
echo "3. Execute 'npm run db:push' para aplicar migrações"
echo "4. Execute 'npm run seed' para inserir dados iniciais"
echo "5. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo ""
print_info "Para usar Docker:"
echo "1. Configure as variáveis no .env"
echo "2. Execute 'docker-compose up --build'"
echo ""
print_success "Setup concluído! Boa sorte com o desenvolvimento! 🚀"