# AgriCredit System - Angular Credit Application Platform

## Overview

AgriCredit is a comprehensive web application designed to democratize access to agricultural credit in Angola. The platform connects farmers, agricultural companies, and financial institutions, providing a streamlined process for credit applications, simulations, and account management. The system features a bilingual interface (Portuguese) and handles Angolan currency (AOA) with localized formatting.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 27, 2025**: **SISTEMA DE PERMISSÕES COMPLETO IMPLEMENTADO** 🔐
  - ✅ **PermissionGate Component**: Controlo granular de renderização baseado em permissões
  - ✅ **usePermissions Hook**: Hook para verificação de permissões em tempo real
  - ✅ **API de Permissões**: Endpoint `/api/user/permissions` para carregar permissões do utilizador
  - ✅ **Filtragem de Interface**: Menus, botões e funcionalidades filtradas por permissão
  - ✅ **Rotas Protegidas**: Sistema de proteção de rotas baseado em permissões
  - ✅ **Admin vs Instituição Financeira**: Interface diferenciada baseada nas permissões de cada perfil
  - ✅ **Todos os Dashboards**: Sistema aplicado em admin-dashboard, dashboard principal e rotas

- **August 6, 2025**: **MIGRAÇÃO COMPLETA PARA REPLIT** 🚀
  - ✅ **Migração bem-sucedida**: Projeto completamente migrado do Replit Agent para Replit
  - ✅ **Database PostgreSQL**: Configurado e populado com dados de teste  
  - ✅ **Aplicação funcionando**: Servidor Express rodando na porta 5000
  - ✅ **Utilizadores de teste**: Admin, agricultor e instituição financeira criados
  - ✅ **Arquitectura MVC**: Reestruturação completa do servidor seguindo padrão Controller-Model-Routes
  - ✅ **Separação de responsabilidades**: Controllers para lógica de negócio, Models para base de dados, Routes para endpoints
  - ✅ **Middleware de autenticação**: Sistema centralizado de autenticação JWT
  - ✅ **Modularização**: Código organizado em módulos independentes e reutilizáveis
  - ✅ **Correção de Bug**: Resolvido problema de varchar length nas notificações
  - ✅ **Aplicações de Crédito**: Sistema funcionando completamente sem erros
  - ✅ **PRD Detalhado**: Documento completo gerado com análise técnica de 112 ficheiros implementados
  - ✅ **Gestão de Utilizadores Multi-tenant**: Sistema completo implementado para gestão de utilizadores internos e visualização de clientes
  - ✅ **API Multi-tenant**: Endpoints `/api/financial-users/*` criados com segurança por instituição
  - ✅ **Schema atualizado**: Campo `parentInstitutionId` adicionado para suporte multi-tenant
  - ✅ **Interface completa**: Componente de gestão com tabs para equipa interna e clientes, formulários de criação/edição
  - ✅ **Seeds atualizados**: Dados de teste ajustados com segregação de instituições financeiras
  - ✅ **Base de dados populada**: 23 permissões, 5 perfis, 3 utilizadores, 5 solicitações, 5 programas de crédito e 1 conta de teste criados

- **July 27, 2025**: **PROJETO COMPLETO E FUNCIONANDO EM PRODUÇÃO** 🎉
  - ✅ **100% do PRD implementado**: Todos os 10 requisitos funcionais e 8 não-funcionais atendidos
  - ✅ **Database PostgreSQL**: Configurado com todas as tabelas e seed de dados inicial
  - ✅ **Painel de Agricultores**: Dashboard completo com solicitações, pagamentos, relatórios
  - ✅ **Painel de Instituições Financeiras**: Sistema de aprovação/rejeição completo
  - ✅ **Utilizador Admin**: admin@agricredit.ao / +244900000000 / admin123
  - ✅ **Sistema de Simulação**: Calculadora de crédito funcionando perfeitamente
  - ✅ **Notificações**: Sistema completo com centro de notificações
  - ✅ **Relatórios**: Página com estatísticas e exportação PDF/Excel
  - ✅ **Gestão de Perfis**: 5 perfis com 20+ permissões granulares
  - ✅ **Pagamentos**: Sistema completo de registo e acompanhamento
  - ✅ **Segurança**: JWT, bcrypt, validação Angola (BI, NIF, telefone)
  - ✅ **Interface**: Design verde/agrícola responsivo com componentes Shadcn/UI

## Utilizadores de Teste para Demonstração

### 👨‍💼 Administrador do Sistema
- **Email**: admin@agricredit.ao
- **Telefone**: +244900000000
- **Palavra-passe**: admin123
- **Acesso**: Painel completo de administração, gestão de utilizadores, aprovação de créditos

### 🌾 Agricultor (João Manuel dos Santos)
- **Email**: joao.santos@gmail.com
- **Telefone**: +244923456789
- **Palavra-passe**: farmer123
- **Acesso**: Dashboard agricultor, solicitações de crédito, simulador, relatórios
- **Dados de teste**: 5 solicitações criadas (pending, approved, rejected, under_review)

### 🏦 Instituição Financeira (Maria Fernanda Silva)
- **Email**: maria.silva@bai.ao
- **Telefone**: +244934567890
- **Palavra-passe**: bank123
- **Acesso**: Painel para análise e aprovação/rejeição de solicitações de crédito

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom agricultural theme colors
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: JWT-based with bcrypt password hashing
- **API Pattern**: RESTful API endpoints

### Database Design
The system uses a PostgreSQL database with the following core entities:
- **Users**: Stores farmer, company, cooperative, financial institution, and admin data
- **Credit Applications**: Manages loan requests with project details and approval workflow
- **Accounts**: Tracks approved credit accounts, balances, and payment schedules
- **Payments**: Records payment history and transactions with account balance updates
- **Notifications**: Manages user notifications for application updates, payments, and reminders

## Key Components

### Authentication System
- JWT token-based authentication with refresh capabilities
- Role-based access control (farmer, company, cooperative, financial_institution)
- Password hashing using bcrypt
- Session management with secure token storage

### Credit Management
- **Application Process**: Multi-step credit application with project type categorization
- **Credit Simulator**: Real-time calculation of loan terms, monthly payments, and interest
- **Account Management**: Track outstanding balances, payment schedules, and account status
- **Payment Processing**: Record and manage loan payments

### User Interface
- **Responsive Design**: Mobile-first approach with agricultural theme
- **Localization**: Portuguese language interface with Angolan formatting
- **Accessibility**: WCAG-compliant components using Radix UI
- **Custom Components**: Specialized forms for agricultural data input

### Angola-Specific Features
- **Phone Validation**: Angolan mobile number format (+244 9XX XXX XXX)
- **Currency Handling**: Kwanza (AOA) formatting and parsing
- **Document Validation**: BI (Bilhete de Identidade) and NIF validation
- **Agricultural Projects**: Support for corn, cassava, cattle, poultry, and horticulture

## Data Flow

### Credit Application Flow
1. User registration with Angolan-specific validation
2. Credit simulation with real-time calculations
3. Formal application submission with project details
4. Financial institution review and approval/rejection
5. Account creation for approved applications
6. Payment tracking and balance management

### Authentication Flow
1. User login with phone/email and password
2. JWT token generation and storage
3. Token validation on protected routes
4. Automatic token refresh for session management

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Express**: Web application framework
- **JWT**: Token-based authentication

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the application
- **Replit Integration**: Development environment plugins

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes

### Environment Configuration
- **Database URL**: Neon PostgreSQL connection string
- **JWT Secret**: Secure token signing key
- **Node Environment**: Development/production configuration

### Production Deployment
- Single-node deployment with Express serving both API and static files
- PostgreSQL database hosted on Neon's serverless platform
- Environment variables for sensitive configuration
- Health checks and error handling for production reliability

The system is designed to scale horizontally while maintaining data consistency and providing a smooth user experience for agricultural credit management in the Angolan market.