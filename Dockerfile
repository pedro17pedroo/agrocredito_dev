# Usar imagem oficial do Node.js LTS baseada em Alpine para menor tamanho
FROM node:18-alpine

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Criar utilizador não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S agrocredito -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    dumb-init \
    curl

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Criar diretório para uploads e definir permissões
RUN mkdir -p /app/uploads && \
    chown -R agrocredito:nodejs /app

# Compilar aplicação TypeScript
RUN npm run build

# Mudar para utilizador não-root
USER agrocredito

# Expor porta da aplicação
EXPOSE 5000

# Verificação de saúde da aplicação
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Usar dumb-init para gestão adequada de sinais
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar aplicação
CMD ["npm", "start"]