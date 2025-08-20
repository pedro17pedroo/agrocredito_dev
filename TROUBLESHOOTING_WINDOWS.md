# 🔧 Resolução de Problemas - Windows

Este guia ajuda a resolver problemas comuns ao executar o AgroCrédito no Windows.

## 🚨 Problemas Comuns

### 1. Scripts de Restore/Seeds Não Funcionam

**Sintomas:**
- `npm run restore:win` para após mostrar a mensagem inicial
- `npm run db:seed` não executa completamente
- Scripts ficam "pendurados" sem resposta

**Soluções:**

#### Opção A: Usar Scripts Melhorados
```bash
# Teste de diagnóstico
npm run debug:win

# Restore com melhor compatibilidade
npm run restore:win:v2:force

# Teste de entrada do utilizador
npm run test:input:win
```

#### Opção B: Verificar Configuração
1. **Verificar MySQL:**
   ```bash
   # Verificar se MySQL está a correr
   net start | findstr MySQL
   
   # Ou verificar serviços
   services.msc
   ```

2. **Verificar .env:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=agrocredito_dev
   DB_USER=root
   DB_PASSWORD=root
   ```

3. **Testar Conexão:**
   ```bash
   mysql -u root -p -h localhost agrocredito_dev
   ```

### 2. Problemas de PowerShell

**Sintomas:**
- Comandos npm não funcionam
- Erros de execução de scripts

**Soluções:**

1. **Executar como Administrador:**
   - Clicar direito no PowerShell
   - "Executar como administrador"

2. **Alterar Política de Execução:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Usar Command Prompt:**
   ```cmd
   cmd
   npm run debug:win
   ```

### 3. Problemas de Encoding

**Sintomas:**
- Caracteres especiais não aparecem corretamente
- Emojis não funcionam

**Soluções:**

1. **Configurar UTF-8:**
   ```powershell
   chcp 65001
   ```

2. **Usar Windows Terminal:**
   - Instalar Windows Terminal da Microsoft Store
   - Configurar perfil para UTF-8

### 4. Problemas de Dependências

**Sintomas:**
- Erros ao instalar pacotes
- Módulos não encontrados

**Soluções:**

1. **Limpar Cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Usar Yarn (alternativa):**
   ```bash
   npm install -g yarn
   yarn install
   ```

## 🔍 Scripts de Diagnóstico

### Script de Debug Completo
```bash
npm run debug:win
```

**O que verifica:**
- ✅ Variáveis de ambiente
- ✅ Conexão MySQL direta
- ✅ Conexão Drizzle
- ✅ Estrutura de ficheiros
- ✅ Backups disponíveis
- ✅ Contagem de dados

### Teste de Entrada do Utilizador
```bash
npm run test:input:win
```

**O que testa:**
- ✅ Interface readline
- ✅ Entrada do utilizador
- ✅ Processamento de input

## 📋 Checklist de Resolução

### Antes de Começar
- [ ] MySQL instalado e a correr
- [ ] Node.js versão 18+ instalado
- [ ] PowerShell ou Command Prompt como administrador
- [ ] Ficheiro .env configurado

### Passos de Diagnóstico
1. [ ] Executar `npm run debug:win`
2. [ ] Verificar se todas as verificações passam
3. [ ] Se falhar conexão MySQL, verificar serviço
4. [ ] Se falhar Drizzle, executar `npm run db:migrate`
5. [ ] Testar entrada: `npm run test:input:win`

### Passos de Restore
1. [ ] Verificar se existem backups: `ls backups/`
2. [ ] Executar restore: `npm run restore:win:v2:force`
3. [ ] Verificar se restore funcionou: `npm run debug:win`
4. [ ] Executar seeds: `npm run db:seed-all:win`

## 🆘 Soluções Alternativas

### Se Nada Funcionar

1. **Usar Docker (Recomendado):**
   ```bash
   npm run docker:dev
   ```

2. **Restore Manual:**
   ```bash
   # Conectar ao MySQL
   mysql -u root -p agrocredito_dev
   
   # Executar backup manualmente
   source C:/caminho/para/backup.sql
   ```

3. **Reinstalar Dependências:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

## 📞 Suporte

Se os problemas persistirem:

1. **Executar diagnóstico completo:**
   ```bash
   npm run debug:win > debug-output.txt 2>&1
   ```

2. **Partilhar output do debug**

3. **Incluir informações do sistema:**
   - Versão do Windows
   - Versão do Node.js: `node --version`
   - Versão do npm: `npm --version`
   - Versão do MySQL: `mysql --version`

## 🔄 Scripts Disponíveis para Windows

| Script | Descrição |
|--------|----------|
| `npm run debug:win` | Diagnóstico completo do sistema |
| `npm run restore:win` | Restore original |
| `npm run restore:win:v2` | Restore melhorado |
| `npm run restore:win:v2:force` | Restore automático |
| `npm run test:input:win` | Teste de entrada do utilizador |
| `npm run backup:win` | Backup da base de dados |
| `npm run db:seed-all:win` | Executar todos os seeds |

---

💡 **Dica:** Sempre execute `npm run debug:win` primeiro para identificar o problema específico.