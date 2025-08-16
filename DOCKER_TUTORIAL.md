# 🐳 Tutorial Docker para Iniciantes - AgroCrédito

## 🎯 O que vais aprender

Este tutorial vai ensinar-te a usar Docker para executar o projeto AgroCrédito sem complicações. No final, vais saber:
- O que é Docker e porque é útil
- Como instalar Docker
- Como executar o projeto com Docker
- Comandos essenciais do Docker
- Como resolver problemas comuns

---

## 🤔 O que é Docker?

**Docker é como uma "caixa mágica"** que contém tudo o que a aplicação precisa para funcionar:
- O código da aplicação
- Node.js
- Base de dados MySQL
- Todas as dependências
- Configurações

**Vantagem:** Não precisas instalar nada no teu computador. Tudo funciona dentro da "caixa" (contentor).

### 🏠 Analogia da Casa
Imagina que queres construir uma casa:
- **Sem Docker:** Tens de comprar materiais, contratar trabalhadores, fazer fundações, etc.
- **Com Docker:** Recebes uma casa pré-fabricada completa, só precisas de a "ligar" à corrente.

---

## 📥 Passo 1: Instalar Docker

### macOS
1. Vai a [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Clica em "Download for Mac"
3. Instala como qualquer aplicação normal
4. Abre Docker Desktop
5. Aguarda até ver "Docker Desktop is running" na barra de menu

### Verificar Instalação
```bash
# Abre o terminal e executa:
docker --version
docker-compose --version

# Deves ver algo como:
# Docker version 24.0.6
# Docker Compose version v2.21.0
```

---

## 🚀 Passo 2: Executar o Projeto

### 1️⃣ Navegar para o Projeto
```bash
# Abre o terminal
# Navega para a pasta do projeto
cd /Users/pedrodivino/Dev/agrocredito_dev
```

### 2️⃣ Preparar Configurações
```bash
# Copia o ficheiro de configuração
cp .env.example .env

# (Opcional) Edita as configurações
nano .env
```

### 3️⃣ Iniciar o Projeto
```bash
# Comando mágico que inicia tudo
docker-compose -f docker-compose.dev.yml up
```

**O que acontece:**
1. Docker descarrega as imagens necessárias (primeira vez demora mais)
2. Cria os contentores para:
   - Base de dados MySQL
   - Backend (servidor Node.js)
   - Frontend (React)
3. Configura a rede entre eles
4. Inicia todos os serviços

### 4️⃣ Aguardar e Testar
```bash
# Aguarda até veres mensagens como:
# ✓ MySQL is ready
# ✓ Backend started on port 5000
# ✓ Frontend started on port 3000
```

**Testa no browser:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📚 Comandos Essenciais

### 🟢 Iniciar Projeto
```bash
# Primeira vez ou quando queres ver os logs
docker-compose -f docker-compose.dev.yml up

# Em background (não bloqueia o terminal)
docker-compose -f docker-compose.dev.yml up -d
```

### 🔴 Parar Projeto
```bash
# Para todos os serviços
docker-compose -f docker-compose.dev.yml down

# Para e remove dados da base de dados
docker-compose -f docker-compose.dev.yml down -v
```

### 📊 Ver Status
```bash
# Ver que contentores estão a correr
docker-compose -f docker-compose.dev.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f app
```

### 🔄 Reiniciar
```bash
# Reiniciar todos os serviços
docker-compose -f docker-compose.dev.yml restart

# Reiniciar um serviço específico
docker-compose -f docker-compose.dev.yml restart app
```

### 🔧 Executar Comandos
```bash
# Executar comandos dentro do contentor
docker-compose -f docker-compose.dev.yml exec app npm run db:seed
docker-compose -f docker-compose.dev.yml exec app npm install nova-dependencia
```

---

## 🛠️ Fluxo de Trabalho Diário

### 🌅 Manhã (Iniciar Trabalho)
```bash
cd /Users/pedrodivino/Dev/agrocredito_dev
docker-compose -f docker-compose.dev.yml up -d
```

### 💻 Durante o Dia
- Edita o código normalmente
- As mudanças são automaticamente refletidas
- Não precisas reiniciar nada

### 🌙 Final do Dia
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🆘 Resolução de Problemas

### ❌ Problema: "Port already in use"
```bash
# Ver que processo está a usar a porta
lsof -i :3000
lsof -i :5000

# Matar processo específico
kill -9 <PID>

# Ou usar portas diferentes no docker-compose.dev.yml
```

### ❌ Problema: "Cannot connect to database"
```bash
# Verificar se MySQL está a correr
docker-compose -f docker-compose.dev.yml ps

# Ver logs do MySQL
docker-compose -f docker-compose.dev.yml logs mysql

# Reiniciar MySQL
docker-compose -f docker-compose.dev.yml restart mysql
```

### ❌ Problema: "Module not found"
```bash
# Reinstalar dependências dentro do contentor
docker-compose -f docker-compose.dev.yml exec app npm install

# Ou reconstruir a imagem
docker-compose -f docker-compose.dev.yml up --build
```

### ❌ Problema: "Docker daemon not running"
```bash
# Abrir Docker Desktop
# Aguardar até estar "running"
# Tentar novamente
```

### 🧹 Limpeza Completa
```bash
# Para tudo e remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove imagens não utilizadas
docker system prune -a

# Recomeçar do zero
docker-compose -f docker-compose.dev.yml up --build
```

---

## 📋 Checklist de Verificação

### ✅ Antes de Começar
- [ ] Docker Desktop instalado e a correr
- [ ] Terminal aberto na pasta do projeto
- [ ] Ficheiro `.env` existe (copiado de `.env.example`)

### ✅ Projeto a Funcionar
- [ ] `docker-compose ps` mostra todos os serviços "Up"
- [ ] http://localhost:3000 carrega o frontend
- [ ] http://localhost:5000 responde com API
- [ ] Logs não mostram erros críticos

### ✅ Desenvolvimento
- [ ] Mudanças no código são refletidas automaticamente
- [ ] Base de dados tem dados de teste
- [ ] Consegues fazer login na aplicação

---

## 🎓 Conceitos Importantes

### 🏗️ **Contentor vs Imagem**
- **Imagem:** "Receita" para criar um contentor (como um molde)
- **Contentor:** Instância em execução de uma imagem (como um bolo feito do molde)

### 🌐 **Volumes**
- Permitem que os dados persistam mesmo quando o contentor é removido
- O teu código é "montado" no contentor (mudanças são sincronizadas)

### 🔗 **Rede**
- Os contentores comunicam entre si através de uma rede interna
- O frontend (porta 3000) fala com o backend (porta 5000)
- O backend fala com a base de dados (porta 3306)

### 📝 **docker-compose.yml**
- Ficheiro que define todos os serviços
- Como uma "receita" para criar o ambiente completo
- Especifica portas, volumes, variáveis de ambiente, etc.

---

## 🚀 Próximos Passos

Depois de dominares o Docker básico:

1. **Aprende sobre produção:** Como usar PM2 para deploy real
2. **Explora o código:** Entende como o frontend e backend comunicam
3. **Personaliza:** Adiciona novas funcionalidades
4. **Deploy:** Coloca a aplicação online

---

## 💡 Dicas Finais

- **Paciência:** A primeira execução demora mais (descarrega imagens)
- **Logs são teus amigos:** Sempre verifica os logs quando algo não funciona
- **Backup:** Faz backup dos dados importantes antes de fazer `down -v`
- **Experimenta:** Docker é seguro, podes "partir" e reconstruir facilmente

**Lembra-te:** Com Docker, o teu ambiente de desenvolvimento é consistente e isolado. Se algo correr mal, podes sempre recomeçar do zero! 🎉