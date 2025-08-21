# Perguntas e Respostas - Defesa Final de Curso
## Sistema AgroCredit - Plataforma de Crédito Agrícola

---

### 1) Qual é o tipo de Segurança implementada?
**R:** O sistema implementa múltiplas camadas de segurança:
- **JWT (JSON Web Tokens)** para autenticação e autorização
- **Bcrypt** para hash seguro de senhas
- **Express Session** com secure storage
- **Middleware de autenticação** personalizado
- **Validação de dados** no frontend e backend
- **Sanitização de inputs** para prevenir ataques de injeção

---

### 2) Na conclusão, você menciona uma base de dados estruturada. Pode detalhar como ela garante eficiência?
**R:** A base de dados foi estruturada com:
- **Schema bem definido** usando Drizzle ORM com TypeScript
- **Relacionamentos otimizados** entre tabelas (users, profiles, credit_applications, etc.)
- **Índices apropriados** para consultas frequentes
- **Normalização adequada** para evitar redundância
- **Pool de conexões MySQL** para gerenciar conexões eficientemente
- **Queries otimizadas** com prepared statements
- **Estrutura modular** que facilita manutenção e escalabilidade

---

### 3) Como a aplicação garante segurança e privacidade dos dados dos usuários?
**R:** A segurança e privacidade são garantidas através de:
- **Criptografia de senhas** com bcrypt (salt rounds)
- **Tokens JWT** com expiração controlada
- **Middleware de autenticação** que valida cada requisição
- **Validação rigorosa** de dados de entrada
- **Sanitização** de inputs para prevenir XSS e SQL Injection
- **Controle de acesso baseado em roles** (admin, user, financial)
- **Armazenamento seguro** de dados sensíveis
- **Variáveis de ambiente** para configurações sensíveis
- **HTTPS** para comunicação segura (em produção)

---

### 4) Cria um evento novo (a função principal do sistema), e finaliza a criação.
**R:** A função principal é **criar uma nova solicitação de crédito**:
1. **Cadastro de usuário** → Criar conta com dados pessoais
2. **Criação de perfil** → Adicionar informações específicas (agricultor/empresa)
3. **Solicitação de crédito** → Escolher programa de crédito e preencher formulário
4. **Upload de documentos** → Anexar documentação necessária
5. **Submissão** → Enviar para análise da instituição financeira
6. **Acompanhamento** → Visualizar status da solicitação

---

### 5) Mostra onde são guardados os relatórios na base de dados?
**R:** Os relatórios são gerados a partir das seguintes tabelas:
- **`credit_applications`** → Dados das solicitações de crédito
- **`payments`** → Histórico de pagamentos
- **`notifications`** → Log de atividades do sistema
- **`profiles`** → Informações dos perfis de usuários
- **`accounts`** → Dados das contas financeiras

Os relatórios são gerados dinamicamente através de queries SQL complexas que agregam dados dessas tabelas.

---

### 6) Como aplicaste a segurança no sistema, para evitar que tenha dados repetidos de cadastro?
**R:** Para evitar duplicação de dados:
- **Constraints UNIQUE** no schema da base de dados (email, BI, telefone)
- **Validação no backend** antes de inserir novos registros
- **Verificação de existência** de email/BI antes do cadastro
- **Middleware de validação** que verifica duplicatas
- **Mensagens de erro específicas** para dados já existentes
- **Transações de base de dados** para garantir consistência

---

### 7) O sistema é responsivo e porquê?
**R:** Sim, o sistema é totalmente responsivo porque:
- **Tailwind CSS** com classes responsivas (sm:, md:, lg:, xl:)
- **Grid e Flexbox** para layouts adaptativos
- **Componentes React** que se ajustam ao tamanho da tela
- **Design mobile-first** com breakpoints bem definidos
- **Testes em diferentes dispositivos** durante o desenvolvimento
- **Media queries** personalizadas quando necessário

---

### 8) Onde está a conexão com a BD?
**R:** A conexão com a base de dados está configurada em:
- **Ficheiro `.env`** → Variáveis de ambiente (DATABASE_URL, DB_HOST, etc.)
- **`server/db.ts`** → Configuração do pool de conexões MySQL
- **`drizzle.config.ts`** → Configuração do ORM Drizzle
- **`shared/schema.ts`** → Definição do schema da base de dados

---

### 9) Onde utilizou MVC?
**R:** O padrão MVC foi implementado da seguinte forma:
- **Model** → `shared/schema.ts` e `server/models/` (estrutura de dados)
- **View** → `client/src/pages/` e `client/src/components/` (interface do usuário)
- **Controller** → `server/controllers/` (lógica de negócio e processamento)
- **Routes** → `server/routes/` (roteamento e middleware)

---

### 10) Como mudar 6 para 9 dígitos na palavra-passe?
**R:** Para alterar a validação de senha:
1. **Frontend** → Modificar validação em `client/src/components/` (min: 9)
2. **Backend** → Atualizar middleware de validação em `server/middleware/`
3. **Schema** → Ajustar validações no schema se necessário
4. **Mensagens** → Atualizar mensagens de erro para refletir nova regra

---

### 11) Como mudar a cor?
**R:** Para mudar cores do sistema:
- **Tailwind Config** → `tailwind.config.ts` (definir cores personalizadas)
- **CSS Variables** → `client/src/index.css` (tema claro/escuro)
- **Componentes** → Atualizar classes Tailwind nos componentes React
- **Theme Provider** → Configurar sistema de temas dinâmico

---

### 12) Como mudar as permissões dos utilizadores?
**R:** Para alterar permissões:
1. **Schema** → Modificar enum de roles em `shared/schema.ts`
2. **Middleware** → Atualizar `server/middleware/auth.ts`
3. **Controllers** → Ajustar verificações de permissão
4. **Frontend** → Atualizar componentes baseados em roles
5. **Base de dados** → Executar migration para atualizar dados existentes

---

### 13) Onde está a encriptação, criptografia, autenticação?
**R:** Implementadas em:
- **`server/middleware/auth.ts`** → Middleware de autenticação JWT
- **`server/controllers/AuthController.ts`** → Lógica de login/registro
- **Bcrypt** → Hash de senhas (usado nos controllers)
- **JWT** → Geração e validação de tokens
- **Express Session** → Gestão de sessões seguras

---

### 14) Que tipo de ataque está sujeito a palavra-passe menos de 6 dígitos?
**R:** Senhas com menos de 6 dígitos são vulneráveis a:
- **Ataque de Força Bruta** → Tentar todas as combinações possíveis
- **Ataques de Dicionário** → Usar palavras comuns ("123456", "admin")
- **Engenharia Social** → Adivinhar baseado em informações pessoais
- **Rainbow Tables** → Tabelas pré-computadas de hashes
- **Ataques de Timing** → Explorar tempo de resposta do sistema

---

### 15) O que acontece se pegar no token e levar em diferente browser?
**R:** O sistema foi projetado para:
- **Validar o token** independentemente do browser
- **Verificar expiração** do JWT
- **Manter sessão ativa** enquanto o token for válido
- **Implementar refresh tokens** para renovação segura
- **Log de atividades** para monitorar acessos suspeitos

---

### 16) É possível cadastrar-se com o mesmo BI ou senha que outro utilizador cadastrou?
**R:** **Não é possível** devido a:
- **Constraints UNIQUE** na base de dados para BI e email
- **Validação no backend** que verifica duplicatas
- **Mensagens de erro específicas** informando dados já existentes
- **Verificação prévia** antes de inserir novos registros
- **Transações atômicas** que garantem consistência

---

### 17) Mostre detalhadamente toda funcionalidade do sistema.
**R:** O sistema AgroCredit possui as seguintes funcionalidades:

#### **Autenticação e Autorização:**
- Registro de novos usuários
- Login com email/senha
- Recuperação de senha
- Gestão de sessões JWT
- Controle de acesso por roles

#### **Gestão de Perfis:**
- Criação de perfis (Agricultor Individual, Empresa Agrícola)
- Edição de informações pessoais
- Upload de documentos
- Validação de dados

#### **Programas de Crédito:**
- Visualização de programas disponíveis
- Filtros por tipo e valor
- Detalhes de cada programa
- Requisitos e condições

#### **Solicitações de Crédito:**
- Criação de nova solicitação
- Preenchimento de formulários
- Upload de documentação
- Acompanhamento de status
- Histórico de solicitações

#### **Painel Administrativo:**
- Gestão de usuários
- Aprovação/rejeição de solicitações
- Relatórios e estatísticas
- Configuração de programas

#### **Notificações:**
- Alertas de status
- Lembretes de documentos
- Comunicações do sistema

#### **Relatórios:**
- Relatórios de solicitações
- Estatísticas de aprovação
- Análise de performance
- Exportação de dados

#### **Segurança:**
- Criptografia de dados sensíveis
- Auditoria de ações
- Backup automático
- Monitoramento de acessos

---

## Tecnologias Utilizadas

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Base de Dados:** MySQL + Drizzle ORM
- **Autenticação:** JWT + Bcrypt
- **Deployment:** Docker + PM2
- **Versionamento:** Git + GitHub

---

*Documento gerado para defesa final do curso de Engenharia Informática*
*Sistema AgroCredit - Plataforma de Crédito Agrícola*