#!/usr/bin/env tsx

/**
 * Script de Seed para o AgroCrédito
 * Popula o banco de dados com dados iniciais para desenvolvimento e testes
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { 
  profiles, 
  permissions, 
  profilePermissions, 
  users, 
  creditPrograms,
  accounts 
} from '../shared/schema.js';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// Carregar variáveis de ambiente
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida no arquivo .env');
  process.exit(1);
}

// Configurar conexão com o banco
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🌱 Iniciando seed do banco de dados...');

try {
  // 1. Criar perfis
  console.log('📝 Criando perfis...');
  const profilesData = [
    { id: nanoid(), name: 'Administrador', description: 'Acesso total ao sistema' },
    { id: nanoid(), name: 'Gestor', description: 'Gestão de programas e aplicações de crédito' },
    { id: nanoid(), name: 'Analista', description: 'Análise de aplicações de crédito' },
    { id: nanoid(), name: 'Operador', description: 'Operações básicas do sistema' },
    { id: nanoid(), name: 'Cliente', description: 'Acesso limitado para clientes' }
  ];
  
  await db.insert(profiles).values(profilesData);
  console.log(`✅ ${profilesData.length} perfis criados`);

  // 2. Criar permissões
  console.log('🔐 Criando permissões...');
  const permissionsData = [
    // Permissões de usuários
    { id: nanoid(), name: 'users.create', description: 'Criar usuários', module: 'users', action: 'create' },
    { id: nanoid(), name: 'users.read', description: 'Visualizar usuários', module: 'users', action: 'read' },
    { id: nanoid(), name: 'users.update', description: 'Atualizar usuários', module: 'users', action: 'update' },
    { id: nanoid(), name: 'users.delete', description: 'Excluir usuários', module: 'users', action: 'delete' },
    
    // Permissões de programas de crédito
    { id: nanoid(), name: 'credit_programs.create', description: 'Criar programas de crédito', module: 'credit_programs', action: 'create' },
    { id: nanoid(), name: 'credit_programs.read', description: 'Visualizar programas de crédito', module: 'credit_programs', action: 'read' },
    { id: nanoid(), name: 'credit_programs.update', description: 'Atualizar programas de crédito', module: 'credit_programs', action: 'update' },
    { id: nanoid(), name: 'credit_programs.delete', description: 'Excluir programas de crédito', module: 'credit_programs', action: 'delete' },
    
    // Permissões de aplicações de crédito
    { id: nanoid(), name: 'credit_applications.create', description: 'Criar aplicações de crédito', module: 'credit_applications', action: 'create' },
    { id: nanoid(), name: 'credit_applications.read', description: 'Visualizar aplicações de crédito', module: 'credit_applications', action: 'read' },
    { id: nanoid(), name: 'credit_applications.update', description: 'Atualizar aplicações de crédito', module: 'credit_applications', action: 'update' },
    { id: nanoid(), name: 'credit_applications.approve', description: 'Aprovar aplicações de crédito', module: 'credit_applications', action: 'approve' },
    { id: nanoid(), name: 'credit_applications.reject', description: 'Rejeitar aplicações de crédito', module: 'credit_applications', action: 'reject' },
    
    // Permissões de contas
    { id: nanoid(), name: 'accounts.create', description: 'Criar contas', module: 'accounts', action: 'create' },
    { id: nanoid(), name: 'accounts.read', description: 'Visualizar contas', module: 'accounts', action: 'read' },
    { id: nanoid(), name: 'accounts.update', description: 'Atualizar contas', module: 'accounts', action: 'update' },
    
    // Permissões de pagamentos
    { id: nanoid(), name: 'payments.create', description: 'Registrar pagamentos', module: 'payments', action: 'create' },
    { id: nanoid(), name: 'payments.read', description: 'Visualizar pagamentos', module: 'payments', action: 'read' },
    
    // Permissões administrativas
    { id: nanoid(), name: 'admin.dashboard', description: 'Acesso ao dashboard administrativo', module: 'admin', action: 'dashboard' },
    { id: nanoid(), name: 'admin.reports', description: 'Gerar relatórios', module: 'admin', action: 'reports' },
    { id: nanoid(), name: 'admin.settings', description: 'Configurações do sistema', module: 'admin', action: 'settings' }
  ];
  
  await db.insert(permissions).values(permissionsData);
  console.log(`✅ ${permissionsData.length} permissões criadas`);

  // 3. Associar permissões aos perfis
  console.log('🔗 Associando permissões aos perfis...');
  
  // Administrador - todas as permissões
  const adminProfile = profilesData.find(p => p.name === 'Administrador')!;
  const adminPermissions = permissionsData.map(permission => ({
    id: nanoid(),
    profileId: adminProfile.id,
    permissionId: permission.id
  }));
  
  await db.insert(profilePermissions).values(adminPermissions);
  console.log(`✅ ${adminPermissions.length} permissões associadas ao Administrador`);

  // 4. Criar usuários
  console.log('👥 Criando usuários...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const usersData = [
    {
      id: nanoid(),
      fullName: 'Administrador do Sistema',
      bi: '000000000LA000',
      nif: '5000000000',
      phone: '+244900000000',
      email: 'admin@agrocredito.ao',
      password: hashedPassword,
      userType: 'admin' as const,
      profileId: adminProfile.id,
      isActive: true
    },
    {
      id: nanoid(),
      fullName: 'Gestor Principal',
      bi: '000000001LA000',
      nif: '5000000001',
      phone: '+244900000001',
      email: 'gestor@agrocredito.ao',
      password: hashedPassword,
      userType: 'financial_institution' as const,
      profileId: profilesData.find(p => p.name === 'Gestor')!.id,
      isActive: true
    },
    {
      id: nanoid(),
      fullName: 'Analista de Crédito',
      bi: '000000002LA000',
      nif: '5000000002',
      phone: '+244900000002',
      email: 'analista@agrocredito.ao',
      password: hashedPassword,
      userType: 'financial_institution' as const,
      profileId: profilesData.find(p => p.name === 'Analista')!.id,
      isActive: true
    }
  ];
  
  await db.insert(users).values(usersData);
  console.log(`✅ ${usersData.length} usuários criados`);

  // 5. Criar programas de crédito
  console.log('💰 Criando programas de crédito...');
  const financialInstitutionId = usersData.find(u => u.userType === 'financial_institution')!.id;
  
  const creditProgramsData = [
    {
      id: nanoid(),
      financialInstitutionId,
      name: 'Crédito Agrícola Básico',
      description: 'Programa de crédito para pequenos agricultores',
      projectTypes: JSON.stringify(['agricultura', 'pecuaria']),
      minAmount: '50000.00',
      maxAmount: '500000.00',
      minTerm: 6,
      maxTerm: 24,
      interestRate: '12.50',
      effortRate: '30.00',
      processingFee: '2.00',
      requirements: JSON.stringify(['Bilhete de Identidade', 'Declaração do Soba', 'Comprovativo de Atividade Agrícola']),
      benefits: JSON.stringify(['Taxa de juro reduzida', 'Período de carência', 'Assistência técnica']),
      isActive: true
    },
    {
      id: nanoid(),
      financialInstitutionId,
      name: 'Crédito Pecuário',
      description: 'Programa específico para criação de gado',
      projectTypes: JSON.stringify(['pecuaria']),
      minAmount: '100000.00',
      maxAmount: '1000000.00',
      minTerm: 12,
      maxTerm: 36,
      interestRate: '15.00',
      effortRate: '35.00',
      processingFee: '2.50',
      requirements: JSON.stringify(['Bilhete de Identidade', 'Declaração do Soba', 'Plano de Negócio']),
      benefits: JSON.stringify(['Assistência veterinária', 'Formação técnica', 'Seguro de gado']),
      isActive: true
    },
    {
      id: nanoid(),
      financialInstitutionId,
      name: 'Microcrédito Rural',
      description: 'Microcrédito para atividades rurais diversas',
      projectTypes: JSON.stringify(['agricultura', 'comercio', 'servicos']),
      minAmount: '25000.00',
      maxAmount: '200000.00',
      minTerm: 3,
      maxTerm: 18,
      interestRate: '18.00',
      effortRate: '25.00',
      processingFee: '1.50',
      requirements: JSON.stringify(['Bilhete de Identidade', 'Atestado de Residência']),
      benefits: JSON.stringify(['Processo simplificado', 'Aprovação rápida']),
      isActive: true
    }
  ];
  
  await db.insert(creditPrograms).values(creditProgramsData);
  console.log(`✅ ${creditProgramsData.length} programas de crédito criados`);

  // Nota: As contas são criadas automaticamente quando uma aplicação de crédito é aprovada
  console.log('ℹ️  As contas serão criadas automaticamente quando aplicações de crédito forem aprovadas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log(`   • ${profilesData.length} perfis`);
  console.log(`   • ${permissionsData.length} permissões`);
  console.log(`   • ${usersData.length} usuários`);
  console.log(`   • ${creditProgramsData.length} programas de crédito`);
  console.log(`   • Contas serão criadas quando aplicações forem aprovadas`);
  
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Email: admin@agrocredito.ao');
  console.log('   Senha: 123456');
  console.log('\n   Email: gestor@agrocredito.ao');
  console.log('   Senha: 123456');
  console.log('\n   Email: analista@agrocredito.ao');
  console.log('   Senha: 123456');

} catch (error) {
  console.error('❌ Erro durante o seed:', error);
  process.exit(1);
} finally {
  await connection.end();
  console.log('\n🔌 Conexão com o banco de dados encerrada');
}