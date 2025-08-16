#!/bin/bash

# Script de inicialização para Docker
# Executa migrações e seeds antes de iniciar a aplicação

set -e

echo "🚀 Iniciando configuração da aplicação AgroCrédito..."

# Aguardar que a base de dados esteja disponível
echo "⏳ Aguardando conexão com a base de dados..."
while ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    echo "Base de dados ainda não está disponível. Aguardando..."
    sleep 2
done

echo "✅ Base de dados conectada com sucesso!"

# Executar migrações
echo "📊 Executando migrações da base de dados..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Migrações executadas com sucesso!"
else
    echo "❌ Erro ao executar migrações"
    exit 1
fi

# Executar seeds
echo "🌱 Executando seeds da base de dados..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Seeds executados com sucesso!"
else
    echo "⚠️ Aviso: Erro ao executar seeds (pode ser normal se já existirem dados)"
fi

echo "🎉 Configuração concluída! Iniciando aplicação..."

# Iniciar aplicação
exec "$@"