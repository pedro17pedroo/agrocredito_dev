#!/bin/bash

# ==============================================
# SCRIPT DE DEPLOY - AGROCREDITO
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
APP_NAME="agrocredito"
DEPLOY_USER="deploy"
SERVER_HOST=""
DEPLOY_PATH="/var/www/agrocredito"
BACKUP_PATH="/var/backups/agrocredito"
GIT_REPO="https://github.com/seu-usuario/agrocredito_dev.git"
BRANCH="main"

# Verificar argumentos
if [ $# -eq 0 ]; then
    print_error "Uso: $0 <servidor> [branch]"
    print_info "Exemplo: $0 production.agrocredito.ao main"
    exit 1
fi

SERVER_HOST="$1"
if [ $# -gt 1 ]; then
    BRANCH="$2"
fi

print_info "Iniciando deploy do AgroCrédito..."
print_info "Servidor: $SERVER_HOST"
print_info "Branch: $BRANCH"
print_info "Caminho: $DEPLOY_PATH"

# Função para executar comandos no servidor remoto
execute_remote() {
    ssh "$DEPLOY_USER@$SERVER_HOST" "$1"
}

# Função para copiar ficheiros para o servidor
copy_to_server() {
    scp -r "$1" "$DEPLOY_USER@$SERVER_HOST:$2"
}

# 1. Verificar conectividade com o servidor
print_info "Verificando conectividade com o servidor..."
if ! ssh -o ConnectTimeout=10 "$DEPLOY_USER@$SERVER_HOST" "echo 'Conexão estabelecida'"; then
    print_error "Não foi possível conectar ao servidor $SERVER_HOST"
    exit 1
fi
print_success "Conectividade verificada"

# 2. Criar backup da aplicação atual
print_info "Criando backup da aplicação atual..."
execute_remote "sudo mkdir -p $BACKUP_PATH"
execute_remote "sudo cp -r $DEPLOY_PATH $BACKUP_PATH/backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true"
print_success "Backup criado"

# 3. Parar aplicação
print_info "Parando aplicação..."
execute_remote "sudo systemctl stop $APP_NAME || sudo pm2 stop $APP_NAME || true"
print_success "Aplicação parada"

# 4. Atualizar código
print_info "Atualizando código..."
execute_remote "cd $DEPLOY_PATH && sudo git fetch origin && sudo git reset --hard origin/$BRANCH"
print_success "Código atualizado"

# 5. Instalar dependências
print_info "Instalando dependências..."
execute_remote "cd $DEPLOY_PATH && sudo npm ci --production"
print_success "Dependências instaladas"

# 6. Compilar aplicação
print_info "Compilando aplicação..."
execute_remote "cd $DEPLOY_PATH && sudo npm run build"
print_success "Aplicação compilada"

# 7. Executar migrações
print_info "Executando migrações da base de dados..."
execute_remote "cd $DEPLOY_PATH && sudo npm run db:push"
print_success "Migrações executadas"

# 8. Definir permissões
print_info "Definindo permissões..."
execute_remote "sudo chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH"
execute_remote "sudo chmod -R 755 $DEPLOY_PATH"
execute_remote "sudo chmod -R 777 $DEPLOY_PATH/uploads"
print_success "Permissões definidas"

# 9. Iniciar aplicação
print_info "Iniciando aplicação..."
execute_remote "sudo systemctl start $APP_NAME || sudo pm2 start $APP_NAME || cd $DEPLOY_PATH && sudo npm start &"
sleep 5
print_success "Aplicação iniciada"

# 10. Verificar saúde da aplicação
print_info "Verificando saúde da aplicação..."
for i in {1..5}; do
    if execute_remote "curl -f http://localhost:5000/api/health" &>/dev/null; then
        print_success "Aplicação está saudável"
        break
    else
        print_warning "Tentativa $i/5 - Aguardando aplicação..."
        sleep 10
    fi
    
    if [ $i -eq 5 ]; then
        print_error "Aplicação não está a responder. Verificar logs."
        print_info "Logs da aplicação:"
        execute_remote "sudo journalctl -u $APP_NAME --lines=20 || sudo pm2 logs $APP_NAME --lines 20 || tail -20 $DEPLOY_PATH/logs/app.log"
        exit 1
    fi
done

# 11. Limpar backups antigos
print_info "Limpando backups antigos..."
execute_remote "sudo find $BACKUP_PATH -name 'backup_*' -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true"
print_success "Backups antigos removidos"

# 12. Informações finais
print_success "Deploy concluído com sucesso! 🚀"
print_info "Aplicação disponível em: http://$SERVER_HOST"
print_info "Para verificar logs: ssh $DEPLOY_USER@$SERVER_HOST 'sudo journalctl -u $APP_NAME -f'"
print_info "Para fazer rollback: ssh $DEPLOY_USER@$SERVER_HOST 'sudo cp -r $BACKUP_PATH/backup_* $DEPLOY_PATH'"

echo ""
print_info "Comandos úteis:"
echo "- Ver status: ssh $DEPLOY_USER@$SERVER_HOST 'sudo systemctl status $APP_NAME'"
echo "- Ver logs: ssh $DEPLOY_USER@$SERVER_HOST 'sudo journalctl -u $APP_NAME -f'"
echo "- Reiniciar: ssh $DEPLOY_USER@$SERVER_HOST 'sudo systemctl restart $APP_NAME'"
echo "- Parar: ssh $DEPLOY_USER@$SERVER_HOST 'sudo systemctl stop $APP_NAME'"