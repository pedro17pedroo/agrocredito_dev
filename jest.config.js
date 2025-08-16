/** @type {import('jest').Config} */
module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Extensões de arquivo suportadas
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformação de arquivos TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }]
  },
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // Configuração de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  
  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Configuração de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
  },
  
  // Configuração de setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Configuração de ambiente
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Configuração de timeout
  testTimeout: 30000,
  
  // Configuração de cache
  clearMocks: true,
  restoreMocks: true,
  
  // Configuração de verbose
  verbose: true,
  
  // Configuração de detecção de arquivos abertos
  detectOpenHandles: true,
  forceExit: true,
  
  // Configuração de globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          target: 'es2020',
          lib: ['es2020'],
          allowJs: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx'
        }
      }
    }
  },
  
  // Configuração de preset
  preset: 'ts-jest',
  
  // Configuração de extensões de módulo
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Configuração de transformação de arquivos estáticos
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Configuração de reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ],
  
  // Configuração de watch
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // Configuração de máximo de workers
  maxWorkers: '50%',
  
  // Configuração de bail
  bail: false,
  
  // Configuração de notificações
  notify: false,
  notifyMode: 'failure-change'
};