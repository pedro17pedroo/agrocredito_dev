# 🌾 AgroCrédito - Guia para Windows

Guia específico para configurar e executar o AgroCrédito em sistemas Windows.

## 📋 Pré-requisitos

### 1. **Node.js** (versão 18 ou superior)
- Descarregue em: https://nodejs.org/
- Verifique a instalação: `node --version`

### 2. **Git**
- Descarregue em: https://git-scm.com/download/win
- Ou use GitHub Desktop: https://desktop.github.com/

### 3. **Docker Desktop** (opcional, mas recomendado)
- Descarregue em: https://www.docker.com/products/docker-desktop/
- Certifique-se de que o WSL 2 está ativado

### 4. **MySQL** (se não usar Docker)
- Descarregue em: https://dev.mysql.com/downloads/mysql/
- Ou use XAMPP: https://www.apachefriends.org/

## 🚀 Configuração Inicial

### 1. **Clonar o repositório**
```bash
git clone <url-do-repositorio>
cd agrocredito_dev
```

### 2. **Configuração automática**
```bash
npm run setup
```

Este comando irá:
- ✅ Verificar se todas as dependências estão instaladas
- ✅ Instalar pacotes npm
- ✅ Criar arquivo `.env` a partir do `.env.example`
- ✅ Criar pastas necessárias (`uploads`, `logs`, `backups`)

### 3. **Configurar variáveis de ambiente**
Edite o arquivo `.env` com as suas configurações:

```env
# Base de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agrocredito
DB_USER=root
DB_PASSWORD=sua_senha

# Aplicação
PORT=5001
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_muito_seguro

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## 🐳 Opção 1: Executar com Docker (Recomendado)

### **Vantagens:**
- ✅ Configuração automática do MySQL
- ✅ Ambiente isolado
- ✅ Funciona igual em todos os sistemas

### **Comandos:**
```bash
# Iniciar aplicação com Docker
npm run docker:dev

# Ou usar docker-compose diretamente
docker-compose -f docker-compose.simple.yml up --build

# Parar aplicação
npm run docker:stop

# Ver logs
npm run docker:logs
```

### **Executar seeds (popular base de dados):**
```bash
# Dentro do container
docker exec agrocredito-app-simple npx tsx server/run-all-seeds.ts

# Ou seeds individuais
docker exec agrocredito-app-simple npm run db:seed
docker exec agrocredito-app-simple npm run db:seed-applications
docker exec agrocredito-app-simple npm run db:seed-credit-programs
```

## 💻 Opção 2: Executar Localmente

### **Pré-requisitos:**
- MySQL instalado e a correr
- Base de dados `agrocredito` criada

### **Comandos:**
```bash
# Instalar dependências
npm install

# Executar migrações
npm run db:push

# Popular base de dados
npm run db:seed
npm run db:seed-applications
npm run db:seed-credit-programs

# Iniciar aplicação
npm run dev
```

## 📜 Scripts Disponíveis

### **Desenvolvimento:**
```bash
npm run dev       # Servidor de desenvolvimento (multiplataforma)
npm run dev:win   # Servidor de desenvolvimento (Windows nativo)
npm run build     # Build para produção
npm run start     # Iniciar servidor de produção (multiplataforma)
npm run start:win # Iniciar servidor de produção (Windows nativo)
npm run check     # Verificar tipos TypeScript
```

### **Base de Dados:**
```bash
npm run db:push              # Aplicar mudanças no schema
npm run db:studio            # Interface visual da BD
npm run db:seed              # Popular BD com dados básicos
npm run db:seed:win          # Popular BD com dados básicos (Windows)
npm run db:seed-all          # Popular BD com todos os dados de teste
npm run db:seed-all:win      # Popular BD com todos os dados de teste (Windows)
npm run db:seed-applications # Popular apenas aplicações de crédito
npm run db:seed-credit-programs # Popular apenas programas de crédito
npm run db:generate          # Gerar migrações
```

### **Docker:**
```bash
npm run docker:build   # Build da imagem Docker
npm run docker:dev     # Executar em modo desenvolvimento
npm run docker:prod    # Executar em modo produção
npm run docker:stop    # Parar containers
npm run docker:logs    # Ver logs dos containers
```

### **Utilitários:**
```bash
npm run setup     # Configuração inicial
npm run backup    # Criar backup da base de dados
npm run restore   # Restaurar backup
npm run deploy    # Deploy da aplicação
npm run clean     # Limpar arquivos temporários
npm run health    # Verificar saúde da aplicação
```

## 🪟 Alternativas Específicas para Windows

### **Scripts PowerShell (Recomendado)**
Para uma experiência mais robusta no Windows, use os scripts PowerShell:

```powershell
# Executar servidor de desenvolvimento
.\scripts\dev-windows.ps1

# Ou via PowerShell diretamente
powershell -ExecutionPolicy Bypass -File .\scripts\dev-windows.ps1
```

### **Scripts Batch (Alternativa)**
Se preferir usar Command Prompt:

```cmd
# Executar servidor de desenvolvimento
.\scripts\dev-windows.bat
```

### **Scripts npm Específicos para Windows**
```bash
npm run dev:win       # Desenvolvimento (Windows)
npm run start:win     # Produção (Windows)
npm run db:seed:win   # Seed básico (Windows)
npm run db:seed-all:win # Seed completo (Windows)
```

### **Seeds no Windows**
✅ **Os scripts de seed funcionam perfeitamente no Windows!**

Todos os scripts de seed foram convertidos para TypeScript e usam `tsx`, que é multiplataforma:

```bash
# Seed básico (usuários, perfis, permissões)
npm run db:seed:win

# Seed completo (inclui aplicações e programas de crédito)
npm run db:seed-all:win

# Seeds específicos
npm run db:seed-applications:win     # Apenas aplicações de crédito
npm run db:seed-credit-programs:win  # Apenas programas de crédito
```

**Nota:** Os scripts `:win` são idênticos aos normais, mas estão disponíveis para consistência com os outros comandos Windows.

## 🔧 Resolução de Problemas

### **Erro: "cross-env não é reconhecido"**
✅ **Resolvido!** Use os scripts específicos para Windows (`npm run dev:win`) ou os scripts PowerShell/Batch.

### **Erro: "NODE_ENV não é reconhecido"**
✅ **Resolvido!** Os scripts Windows usam `set NODE_ENV` em vez de `cross-env`.

### **Erro: "rm não é reconhecido"**
✅ **Resolvido!** Agora usamos `rimraf` para comandos de limpeza.

### **Erro: "./scripts/setup.sh não é reconhecido"**
✅ **Resolvido!** Agora usamos scripts JavaScript (`.js`) em vez de shell (`.sh`).

### **Problemas com MySQL:**
```bash
# Verificar se o MySQL está a correr
net start mysql80  # (ou nome do seu serviço MySQL)

# Ou usar XAMPP
# Iniciar XAMPP Control Panel e ligar MySQL
```

### **Problemas com Docker:**
```bash
# Verificar se o Docker está a correr
docker --version
docker-compose --version

# Reiniciar Docker Desktop se necessário
```

### **Porta já em uso:**
```bash
# Verificar que processo está a usar a porta
netstat -ano | findstr :5001

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

## 🌐 Acesso à Aplicação

- **URL:** http://localhost:5001
- **Drizzle Studio:** http://localhost:4983 (após `npm run db:studio`)

### **Credenciais de Teste:**
- **Admin:** admin@agricredit.ao / admin123
- **Agricultor:** joao.santos@gmail.com / farmer123
- **Instituição Financeira:** maria.silva@bai.ao / bank123
- **Empresa Agrícola:** carlos.mendes@agroangola.ao / company123

## 📁 Estrutura de Pastas

```
agrocredito_dev/
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Código partilhado (schema, tipos)
├── scripts/         # Scripts de configuração e manutenção
├── uploads/         # Arquivos enviados
├── logs/            # Logs da aplicação
├── backups/         # Backups da base de dados
└── docker/          # Configurações Docker
```

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   npm run docker:logs  # Para Docker
   # Ou verifique o terminal onde executou npm run dev
   ```

2. **Limpe e reinstale:**
   ```bash
   npm run clean
   npm install
   npm run setup
   ```

3. **Reinicie os serviços:**
   ```bash
   npm run docker:stop
   npm run docker:dev
   ```

## 🎯 Próximos Passos

1. ✅ Configure as variáveis de ambiente no `.env`
2. ✅ Execute `npm run docker:dev` ou `npm run dev`
3. ✅ Aceda a http://localhost:5001
4. ✅ Faça login com as credenciais de teste
5. ✅ Explore a aplicação!

---

**💡 Dica:** Use sempre `npm run` em vez de executar comandos diretamente para garantir compatibilidade entre sistemas operativos.