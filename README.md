# AgroCrédito - Sistema de Gestão de Crédito Agrícola

## 📋 Visão Geral

O AgroCrédito é uma plataforma digital completa para gestão de crédito agrícola em Angola, desenvolvida para conectar agricultores, cooperativas e instituições financeiras num ecossistema integrado de financiamento rural.

### 🎯 Funcionalidades Principais

- **Gestão de Utilizadores**: Sistema completo de autenticação e autorização com perfis e permissões
- **Programas de Crédito**: Criação e gestão de programas de financiamento por instituições financeiras
- **Candidaturas de Crédito**: Processo completo de candidatura com validação e aprovação
- **Simulador de Crédito**: Ferramenta para calcular condições de financiamento
- **Gestão de Contas**: Acompanhamento de empréstimos ativos e pagamentos
- **Sistema de Notificações**: Comunicação automática entre utilizadores
- **Gestão de Documentos**: Upload e validação de documentos necessários
- **Dashboard Analítico**: Relatórios e métricas para instituições financeiras

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 18 com TypeScript
- Vite como bundler
- TailwindCSS para estilização
- Radix UI para componentes
- Tanstack Query para gestão de estado
- Wouter para roteamento
- Framer Motion para animações

**Backend:**
- Node.js com Express
- TypeScript
- JWT para autenticação
- Bcrypt para hash de passwords
- Multer para upload de ficheiros

**Base de Dados:**
- MySQL 8.0+
- Drizzle ORM para gestão de dados
- Migrações automáticas

**Ferramentas de Desenvolvimento:**
- ESBuild para compilação
- TSX para execução de TypeScript
- Drizzle Kit para migrações

### Estrutura do Projeto

```
agrocredito_dev/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários e configurações
│   │   └── types/         # Definições de tipos
│   └── index.html
├── server/                # Backend Express
│   ├── controllers/       # Controladores da API
│   ├── models/           # Modelos de dados
│   ├── routes/           # Definição de rotas
│   ├── middleware/       # Middlewares personalizados
│   ├── types/            # Tipos do servidor
│   ├── db.ts             # Configuração da base de dados
│   ├── index.ts          # Ponto de entrada do servidor
│   └── storage.ts        # Camada de abstração de dados
├── shared/               # Código partilhado
│   └── schema.ts         # Esquema da base de dados
├── migrations/           # Migrações da base de dados
├── package.json          # Dependências e scripts
├── drizzle.config.ts     # Configuração do Drizzle ORM
├── vite.config.ts        # Configuração do Vite
└── tailwind.config.ts    # Configuração do TailwindCSS
```

## 🚀 Configuração e Instalação

### Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn
- Git

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/agrocredito_dev.git
cd agrocredito_dev
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Base de Dados

#### Criar Base de Dados MySQL

```sql
CREATE DATABASE agrocredito_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'agrocredito'@'localhost' IDENTIFIED BY 'password_segura';
GRANT ALL PRIVILEGES ON agrocredito_dev.* TO 'agrocredito'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configurar Variáveis de Ambiente

Criar ficheiro `.env` na raiz do projeto:

```env
# Configuração da Base de Dados
DATABASE_URL=mysql://agrocredito:password_segura@localhost:3306/agrocredito_dev

# Chave Secreta JWT
JWT_SECRET=sua-chave-secreta-muito-segura-aqui

# Ambiente
NODE_ENV=development

# Porta do Servidor
PORT=5000
```

### 5. Executar Migrações e Seeds

```bash
# Aplicar migrações da base de dados
npm run db:push

# Executar seeds (dados iniciais)
npm run seed
```

### 6. Executar a Aplicação

```bash
# Modo de desenvolvimento
npm run dev

# Ou para produção
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:5000`

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Compila para produção
npm start           # Inicia servidor de produção
npm run check       # Verificação de tipos TypeScript

# Base de Dados
npm run db:push     # Aplica migrações
npm run seed        # Executa seeds

# Utilitários
npm run create-test-account  # Cria conta de teste
```

## 🐳 Configuração Docker

### Dockerfile

Criar `Dockerfile` na raiz do projeto:

```dockerfile
# Usar imagem oficial do Node.js
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Compilar aplicação
RUN npm run build

# Expor porta
EXPOSE 5000

# Comando para iniciar aplicação
CMD ["npm", "start"]
```

### Docker Compose

Criar `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://agrocredito:password@db:3306/agrocredito
      - JWT_SECRET=sua-chave-secreta-producao
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=agrocredito
      - MYSQL_USER=agrocredito
      - MYSQL_PASSWORD=password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

### Comandos Docker

```bash
# Construir e executar
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f
```

## 📦 Transporte para Outro Ambiente

### 1. Preparação do Código

```bash
# Criar arquivo comprimido
tar -czf agrocredito-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=uploads \
  --exclude=.env \
  .
```

### 2. No Servidor de Destino

```bash
# Extrair ficheiros
tar -xzf agrocredito-$(date +%Y%m%d).tar.gz
cd agrocredito_dev

# Instalar dependências
npm ci --production

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com configurações do ambiente

# Executar migrações
npm run db:push
npm run seed

# Iniciar aplicação
npm start
```

### 3. Configuração de Produção

#### Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### PM2 (Gestor de Processos)

```bash
# Instalar PM2
npm install -g pm2

# Criar ficheiro ecosystem.config.js
echo 'module.exports = {
  apps: [{
    name: "agrocredito",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
}' > ecosystem.config.js

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 Gestão com Git

### Fluxo de Trabalho

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/agrocredito_dev.git

# Criar branch para nova funcionalidade
git checkout -b feature/nova-funcionalidade

# Fazer alterações e commit
git add .
git commit -m "feat: adicionar nova funcionalidade"

# Enviar para repositório remoto
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub
# Após aprovação, fazer merge para main
```

### Convenções de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### Branches Importantes

- `main`: Código de produção
- `develop`: Código de desenvolvimento
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes

## 🔐 Segurança

### Configurações Importantes

1. **Variáveis de Ambiente**: Nunca commitar ficheiros `.env`
2. **JWT Secret**: Usar chave forte em produção
3. **Base de Dados**: Configurar utilizador com permissões mínimas
4. **HTTPS**: Sempre usar SSL em produção
5. **Firewall**: Restringir acesso às portas necessárias

### Backup da Base de Dados

```bash
# Criar backup
mysqldump -u agrocredito -p agrocredito_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u agrocredito -p agrocredito_dev < backup_20240101_120000.sql
```

## 📊 Monitorização

### Logs da Aplicação

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Com PM2
pm2 logs agrocredito
```

### Métricas Importantes

- Tempo de resposta da API
- Utilização de CPU e memória
- Conexões à base de dados
- Erros de aplicação
- Tentativas de login falhadas

## 🆘 Resolução de Problemas

### Problemas Comuns

1. **Erro de Conexão à Base de Dados**
   - Verificar se MySQL está a correr
   - Validar credenciais no `.env`
   - Confirmar que a base de dados existe

2. **Erro de Permissões**
   - Verificar se o utilizador tem perfil atribuído
   - Confirmar permissões do perfil

3. **Erro de Upload de Ficheiros**
   - Verificar permissões da pasta `uploads`
   - Confirmar tamanho máximo de ficheiro

### Comandos de Diagnóstico

```bash
# Verificar estado dos serviços
sudo systemctl status mysql
sudo systemctl status nginx
pm2 status

# Verificar logs
journalctl -u mysql
nginx -t
pm2 logs agrocredito --lines 100

# Testar conectividade
telnet localhost 3306
curl http://localhost:5000/api/health
```

## 📞 Suporte

Para questões técnicas ou suporte:

- **Email**: suporte@agrocredito.ao
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/agrocredito_dev/wiki)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/agrocredito_dev/issues)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o ficheiro [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para o sector agrícola angolano**