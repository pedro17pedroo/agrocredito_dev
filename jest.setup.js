// Jest setup file
// Este arquivo é executado antes de cada teste

// Configuração de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/agrocredito_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4'; // Menor para testes mais rápidos
process.env.PORT = '5001';
process.env.CORS_ORIGIN = 'http://localhost:3001';

// Configuração de timeout global
jest.setTimeout(30000);

// Mock de console para testes mais limpos
global.console = {
  ...console,
  // Desabilitar logs durante os testes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock de fetch global para Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Configuração de timezone para testes consistentes
process.env.TZ = 'UTC';

// Mock de Date para testes determinísticos
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

// Configuração de limpeza após cada teste
afterEach(() => {
  // Limpar todos os mocks
  jest.clearAllMocks();
  
  // Restaurar timers se foram mockados
  if (jest.isMockFunction(setTimeout)) {
    jest.useRealTimers();
  }
});

// Configuração de limpeza após todos os testes
afterAll(async () => {
  // Fechar conexões de banco de dados se existirem
  if (global.__DB_CONNECTION__) {
    await global.__DB_CONNECTION__.end();
  }
  
  // Limpar cache de módulos
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Configuração de tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Helpers globais para testes
global.testHelpers = {
  // Helper para criar dados de teste
  createTestUser: () => ({
    id: 1,
    email: 'test@example.com',
    fullName: 'Usuário Teste',
    bi: '123456789LA001',
    nif: '123456789',
    phone: '+244900000000',
    userType: 'client',
    profileId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  // Helper para criar dados de programa de crédito
  createTestCreditProgram: () => ({
    id: 1,
    name: 'Programa Teste',
    description: 'Descrição do programa teste',
    minAmount: '10000.00',
    maxAmount: '1000000.00',
    interestRate: '12.50',
    maxTermMonths: 24,
    projectTypes: JSON.stringify(['agricultura', 'pecuaria']),
    requirements: JSON.stringify(['Documento de identidade', 'Comprovativo de rendimentos']),
    benefits: JSON.stringify(['Taxa de juro reduzida', 'Período de carência']),
    isActive: true,
    financialInstitutionId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  // Helper para criar dados de aplicação de crédito
  createTestCreditApplication: () => ({
    id: 1,
    userId: 1,
    creditProgramId: 1,
    requestedAmount: '500000.00',
    termMonths: 12,
    projectType: 'agricultura',
    projectDescription: 'Projeto de teste para agricultura',
    status: 'pending',
    submittedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  
  // Helper para aguardar um tempo específico
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper para gerar token JWT de teste
  generateTestToken: (payload = { userId: 1, email: 'test@example.com' }) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
};

// Configuração de matchers customizados
expect.extend({
  // Matcher para verificar se um valor é uma data válida
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
  
  // Matcher para verificar se um valor é um email válido
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
  
  // Matcher para verificar se um valor é um valor monetário válido
  toBeValidMonetaryValue(received) {
    const monetaryRegex = /^\d+\.\d{2}$/;
    const pass = typeof received === 'string' && monetaryRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid monetary value`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid monetary value (format: 0.00)`,
        pass: false,
      };
    }
  }
});