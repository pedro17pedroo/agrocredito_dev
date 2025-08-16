#!/bin/bash

# ==============================================
# SCRIPT DE BACKUP - AGROCREDITO
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

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="agrocredito_backup_${DATE}.sql"
COMPRESSED_FILE="agrocredito_backup_${DATE}.sql.gz"

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

print_info "Iniciando backup da base de dados AgroCrédito..."
print_info "Base de dados: $DB_NAME"
print_info "Host: $DB_HOST:$DB_PORT"
print_info "Utilizador: $DB_USER"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se mysqldump está disponível
if ! command -v mysqldump &> /dev/null; then
    print_error "mysqldump não está instalado ou não está no PATH"
    exit 1
fi

# Realizar backup
print_info "Criando backup..."
mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    print_success "Backup criado: $BACKUP_DIR/$BACKUP_FILE"
else
    print_error "Erro ao criar backup"
    exit 1
fi

# Comprimir backup
print_info "Comprimindo backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    print_success "Backup comprimido: $BACKUP_DIR/$COMPRESSED_FILE"
else
    print_error "Erro ao comprimir backup"
    exit 1
fi

# Mostrar informações do backup
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
print_info "Tamanho do backup: $BACKUP_SIZE"

# Limpar backups antigos (manter apenas os últimos 7)
print_info "Limpando backups antigos..."
find "$BACKUP_DIR" -name "agrocredito_backup_*.sql.gz" -type f -mtime +7 -delete
BACKUPS_COUNT=$(find "$BACKUP_DIR" -name "agrocredito_backup_*.sql.gz" -type f | wc -l)
print_info "Backups mantidos: $BACKUPS_COUNT"

print_success "Backup concluído com sucesso! 🎉"
print_info "Ficheiro: $BACKUP_DIR/$COMPRESSED_FILE"
print_info "Para restaurar: ./scripts/restore.sh $COMPRESSED_FILE"