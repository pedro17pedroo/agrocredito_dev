# 🚀 Guia de Início Rápido - AgroCrédito

## 📋 Índice
- [Pré-requisitos](#pré-requisitos)
- [Docker vs PM2 - Qual Escolher?](#docker-vs-pm2---qual-escolher)
- [Opção 1: Desenvolvimento com Docker](#opção-1-desenvolvimento-com-docker)
- [Opção 2: Desenvolvimento Local](#opção-2-desenvolvimento-local)
- [Opção 3: Produção com PM2](#opção-3-produção-com-pm2)
- [Scripts Úteis](#scripts-úteis)
- [Resolução de Problemas](#resolução-de-problemas)

## 🔧 Pré-requisitos

Antes de começar, certifica-te que tens instalado:

### Para Docker:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclui Docker e Docker Compose)
- Git

### Para Desenvolvimento Local:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MySQL](https://dev.mysql.com/downloads/mysql/) ou [MariaDB](https://mariadb.org/download/)
- Git

## 🤔 Docker vs PM2 - Qual Escolher?

### 🐳 **Docker** (Recomendado para Iniciantes)
**O que é:** Uma plataforma que "empacota" toda a aplicação num contentor isolado.

**Vantagens:**
- ✅ **Mais fácil para iniciantes** - tudo funciona "out of the box"
- ✅ **Ambiente consistente** - funciona igual em qualquer máquina
- ✅ **Inclui base de dados** - MySQL já configurado
- ✅ **Isolamento** - não interfere com outros projetos
- ✅ **Fácil limpeza** - remove tudo com um comando

**Quando usar:**
- És iniciante em desenvolvimento
- Queres começar rapidamente sem configurar nada
- Trabalhas em equipa (garante que todos têm o mesmo ambiente)
- Queres testar sem "sujar" o teu sistema

### ⚡ **PM2** (Para Produção)
**O que é:** Um gestor de processos para aplicações Node.js em produção.

**Vantagens:**
- ✅ **Performance superior** - execução nativa
- ✅ **Controlo avançado** - restart automático, logs, monitorização
- ✅ **Escalabilidade** - múltiplas instâncias
- ✅ **Ideal para servidores** - produção real

**Quando usar:**
- Já tens experiência com Node.js
- Queres máxima performance
- Estás a fazer deploy para produção
- Precisas de controlo fino sobre os processos

### 🎯 **Recomendação para Ti**

Como és iniciante, **recomendo começar com Docker**. É mais simples e evita problemas de configuração.

---

## 🐳 Opção 1: Desenvolvimento com Docker

### 1️⃣ Primeiro Setup (só fazes uma vez)

```bash
# 1. Clona o repositório (se ainda não fizeste)
git clone <url-do-repositorio>
cd agrocredito_dev

# 2. Copia o ficheiro de ambiente
cp .env.example .env

# 3. Edita as variáveis de ambiente (opcional para desenvolvimento)
nano .env  # ou usa o teu editor preferido
```

### 2️⃣ Iniciar o Projeto

```bash
# Inicia todos os serviços (base de dados + aplicação)
docker-compose -f docker-compose.dev.yml up

# Ou em background (não bloqueia o terminal)
docker-compose -f docker-compose.dev.yml up -d
```

### 3️⃣ Aceder à Aplicação

Após alguns minutos:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Base de Dados:** localhost:3306

### 4️⃣ Comandos Úteis do Docker

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f app

# Parar todos os serviços
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes (limpa a base de dados)
docker-compose -f docker-compose.dev.yml down -v

# Reconstruir as imagens (após mudanças no Dockerfile)
docker-compose -f docker-compose.dev.yml up --build

# Executar comandos dentro do contentor
docker-compose -f docker-compose.dev.yml exec app npm run db:seed
```

### 5️⃣ Desenvolvimento com Docker

O Docker está configurado com **hot reload**, ou seja:
- Mudanças no código são automaticamente refletidas
- Não precisas reiniciar os contentores
- Os ficheiros são sincronizados entre o teu computador e o contentor

---

## 💻 Opção 2: Desenvolvimento Local

### 1️⃣ Configurar Base de Dados

```bash
# Instalar MySQL (macOS com Homebrew)
brew install mysql
brew services start mysql

# Criar base de dados
mysql -u root -p
CREATE DATABASE agrocredito_dev;
CREATE USER 'agrocredito'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON agrocredito_dev.* TO 'agrocredito'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2️⃣ Configurar Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# Edita o .env com as credenciais da tua base de dados

# 3. Executar migrações
npm run db:push

# 4. Popular com dados iniciais
npm run db:seed
```

### 3️⃣ Executar em Desenvolvimento

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

---

## 🚀 Opção 3: Produção com PM2

### 1️⃣ Preparar para Produção

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Fazer build da aplicação
npm run build

# 3. Configurar variáveis de produção no .env
NODE_ENV=production
PORT=5000
# ... outras variáveis
```

### 2️⃣ Iniciar com PM2

```bash
# Iniciar aplicação
npm run pm2:start

# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar
npm run pm2:restart

# Parar
npm run pm2:stop
```

---

## 📜 Scripts Úteis

O projeto inclui vários scripts no `package.json`:

```bash
# Desenvolvimento
npm run dev              # Inicia frontend e backend
npm run dev:client       # Só frontend
npm run dev:server       # Só backend

# Base de dados
npm run db:generate      # Gera migrações
npm run db:push          # Aplica mudanças ao schema
npm run db:seed          # Popula com dados iniciais
npm run db:studio        # Interface visual da BD

# Docker
npm run docker:dev       # Inicia ambiente de desenvolvimento
npm run docker:build     # Constrói imagens
npm run docker:stop      # Para contentores

# Produção
npm run build            # Build para produção
npm run start            # Inicia em produção
npm run pm2:start        # Inicia com PM2

# Utilitários
npm run setup            # Setup inicial completo
npm run clean            # Limpa ficheiros temporários
npm run backup           # Backup da base de dados
```

---

## 🔧 Resolução de Problemas

### Docker

**Problema:** Porta já em uso
```bash
# Ver que processo está a usar a porta
lsof -i :3000
# Matar o processo ou usar porta diferente
```

**Problema:** Contentor não inicia
```bash
# Ver logs detalhados
docker-compose -f docker-compose.dev.yml logs

# Reconstruir imagens
docker-compose -f docker-compose.dev.yml up --build
```

**Problema:** Base de dados não conecta
```bash
# Verificar se o MySQL está a correr
docker-compose -f docker-compose.dev.yml ps

# Reiniciar só a base de dados
docker-compose -f docker-compose.dev.yml restart mysql
```

### Desenvolvimento Local

**Problema:** Erro de conexão à base de dados
- Verifica se o MySQL está a correr: `brew services list`
- Confirma as credenciais no ficheiro `.env`
- Testa a conexão: `mysql -u agrocredito -p agrocredito_dev`

**Problema:** Dependências em falta
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Resumo para Iniciantes

### Para começar AGORA (mais fácil):
```bash
# 1. Certifica-te que tens Docker Desktop instalado
# 2. Abre o terminal na pasta do projeto
cd agrocredito_dev

# 3. Copia configurações
cp .env.example .env

# 4. Inicia tudo
docker-compose -f docker-compose.dev.yml up

# 5. Aguarda alguns minutos e acede a http://localhost:3000
```

### Fluxo de trabalho diário:
```bash
# Manhã: Iniciar projeto
docker-compose -f docker-compose.dev.yml up -d

# Durante o dia: Desenvolver normalmente
# As mudanças são automaticamente refletidas

# Final do dia: Parar projeto
docker-compose -f docker-compose.dev.yml down
```

**Lembra-te:** Com Docker, não precisas instalar MySQL, Node.js ou configurar nada. Tudo funciona dentro dos contentores! 🎉

Este guia irá ajudá-lo a configurar e executar o projeto AgroCrédito rapidamente.

## 📋 Pré-requisitos

- **Node.js** 18+ instalado
- **MySQL** 8.0+ instalado e em execução
- **Docker** e **Docker Compose** (opcional, mas recomendado)
- **Git** para controle de versão

## ⚡ Configuração Rápida

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd agrocredito_dev
```

### 2. Configuração Automática
```bash
# Executar script de configuração automática
npm run setup
```

Este script irá:
- Verificar dependências
- Criar arquivo `.env` a partir do `.env.example`
- Instalar dependências do projeto
- Criar diretórios necessários

### 3. Configurar Variáveis de Ambiente
Edite o arquivo `.env` criado:

```env
# Configuração essencial
DATABASE_URL="mysql://usuario:senha@localhost:3306/agrocredito"
JWT_SECRET="sua-chave-secreta-muito-segura"
NODE_ENV="development"
PORT=5000
```

### 4. Configurar Base de Dados
```bash
# Aplicar migrações
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

### 5. Executar a Aplicação
```bash
# Modo desenvolvimento
npm run dev

# Ou usando Docker
npm run docker:dev
```

## 🐳 Usando Docker (Recomendado)

### Desenvolvimento
```bash
# Iniciar todos os serviços (app, MySQL, Redis, Adminer)
npm run docker:dev

# Parar serviços
npm run docker:stop

# Ver logs
npm run docker:logs
```

### Produção
```bash
# Build e executar em produção
npm run docker:prod
```

## 🔑 Credenciais de Acesso

Após executar o seed, use estas credenciais para aceder ao sistema:

| Perfil | Email | Senha | Descrição |
|--------|-------|-------|----------|
| **Administrador** | admin@agrocredito.ao | 123456 | Acesso total ao sistema |
| **Gestor** | gestor@agrocredito.ao | 123456 | Gestão de programas e aplicações |
| **Analista** | analista@agrocredito.ao | 123456 | Análise de aplicações de crédito |

## 🌐 URLs de Acesso

- **Aplicação Principal**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Adminer (MySQL)**: http://localhost:8080 (apenas em desenvolvimento)
- **Redis Commander**: http://localhost:8081 (apenas em desenvolvimento)

## 📊 Verificar Status

```bash
# Verificar saúde da aplicação
npm run health

# Ver logs da aplicação
npm run pm2:logs

# Monitorar processos
npm run pm2:monitor
```

## 🛠️ Comandos Úteis

### Base de Dados
```bash
npm run db:studio      # Interface visual do Drizzle
npm run db:generate    # Gerar migrações
npm run db:migrate     # Aplicar migrações
npm run backup         # Criar backup
npm run restore        # Restaurar backup
```

### Docker
```bash
npm run docker:build   # Build da imagem
npm run docker:run     # Executar container
npm run docker:stop    # Parar containers
```

### Produção
```bash
npm run build          # Compilar para produção
npm run start          # Executar em produção
npm run deploy         # Deploy automático
```

## 🔧 Resolução de Problemas

### Erro de Conexão com MySQL
```bash
# Verificar se MySQL está em execução
sudo systemctl status mysql

# Ou usando Docker
docker ps | grep mysql
```

### Porta já em uso
```bash
# Verificar processo usando a porta 5000
lsof -i :5000

# Matar processo se necessário
kill -9 <PID>
```

### Limpar Cache
```bash
npm run clean          # Limpar cache e build
rm -rf node_modules    # Remover dependências
npm install            # Reinstalar dependências
```

### Reset Completo
```bash
# Parar todos os serviços
npm run docker:stop

# Remover volumes Docker (CUIDADO: apaga dados)
docker-compose down -v

# Reconfigurar tudo
npm run setup
npm run db:push
npm run db:seed
```

## 📚 Próximos Passos

1. **Ler a documentação completa**: [README.md](./README.md)
2. **Explorar a API**: Usar ferramentas como Postman ou Insomnia
3. **Configurar ambiente de produção**: Seguir guia no README
4. **Configurar CI/CD**: GitHub Actions já configurado
5. **Personalizar**: Adaptar às suas necessidades específicas

## 🆘 Suporte

Se encontrar problemas:

1. Verificar logs: `npm run docker:logs` ou `npm run pm2:logs`
2. Consultar [README.md](./README.md) para documentação detalhada
3. Verificar issues no repositório Git
4. Contactar a equipa de desenvolvimento

---

**🎉 Parabéns! O AgroCrédito está pronto para usar!**

Acesse http://localhost:5000 e comece a explorar o sistema.