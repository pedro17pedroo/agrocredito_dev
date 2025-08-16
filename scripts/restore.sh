#!/bin/bash

# ==============================================
# SCRIPT DE RESTAURO - AGROCREDITO
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

# Verificar se foi fornecido um ficheiro de backup
if [ $# -eq 0 ]; then
    print_error "Uso: $0 <ficheiro_backup.sql.gz>"
    print_info "Exemplo: $0 ./backups/agrocredito_backup_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se o ficheiro existe
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Ficheiro de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Carregar variáveis de ambiente
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    print_error "Ficheiro .env não encontrado"
    exit 1
fi

# Extrair informações da DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL não está definida no ficheiro .env"
    exit 1
fi

# Parse da DATABASE_URL (formato: mysql://user:password@host:port/database)
DB_INFO=$(echo $DATABASE_URL | sed 's|mysql://||')
DB_USER=$(echo $DB_INFO | cut -d':' -f1)
DB_PASS=$(echo $DB_INFO | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_INFO | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DB_INFO | cut -d':' -f3 | cut -d'/' -f1)
DB_NAME=$(echo $DB_INFO | cut -d'/' -f2)

print_warning "ATENÇÃO: Este processo irá SUBSTITUIR completamente a base de dados atual!"
print_info "Base de dados: $DB_NAME"
print_info "Host: $DB_HOST:$DB_PORT"
print_info "Ficheiro de backup: $BACKUP_FILE"
echo ""
read -p "Tem a certeza que deseja continuar? (digite 'SIM' para confirmar): " confirmation

if [ "$confirmation" != "SIM" ]; then
    print_info "Operação cancelada pelo utilizador"
    exit 0
fi

# Verificar se mysql está disponível
if ! command -v mysql &> /dev/null; then
    print_error "mysql não está instalado ou não está no PATH"
    exit 1
fi

# Verificar se gunzip está disponível
if ! command -v gunzip &> /dev/null; then
    print_error "gunzip não está instalado ou não está no PATH"
    exit 1
fi

print_info "Iniciando restauro da base de dados..."

# Criar ficheiro temporário para descomprimir
TEMP_FILE="/tmp/agrocredito_restore_$(date +%s).sql"

# Descomprimir backup
print_info "Descomprimindo backup..."
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

if [ $? -eq 0 ]; then
    print_success "Backup descomprimido"
else
    print_error "Erro ao descomprimir backup"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Parar aplicação se estiver a correr (opcional)
print_info "Verificando se a aplicação está a correr..."
if pgrep -f "npm.*dev" > /dev/null; then
    print_warning "Aplicação está a correr. Considere pará-la antes do restauro."
fi

# Restaurar base de dados
print_info "Restaurando base de dados..."
mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" < "$TEMP_FILE"

if [ $? -eq 0 ]; then
    print_success "Base de dados restaurada com sucesso!"
else
    print_error "Erro ao restaurar base de dados"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Limpar ficheiro temporário
rm -f "$TEMP_FILE"
print_info "Ficheiro temporário removido"

# Verificar integridade
print_info "Verificando integridade da base de dados..."
TABLE_COUNT=$(mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --password="$DB_PASS" --database="$DB_NAME" -e "SHOW TABLES;" | wc -l)
print_info "Tabelas encontradas: $((TABLE_COUNT - 1))"

print_success "Restauro concluído com sucesso! 🎉"
print_info "A aplicação pode agora ser reiniciada"
print_warning "Lembre-se de executar migrações se necessário: npm run db:push"