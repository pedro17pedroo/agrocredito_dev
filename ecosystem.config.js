module.exports = {
  apps: [
    {
      // Configuração principal da aplicação
      name: 'agrocredito',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/agrocredito',
      
      // Configurações de execução
      instances: 'max', // Usar todos os cores disponíveis
      exec_mode: 'cluster', // Modo cluster para melhor performance
      
      // Configurações de ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // Configurações de logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Configurações de restart
      autorestart: true,
      watch: false, // Não usar watch em produção
      max_memory_restart: '1G',
      restart_delay: 4000,
      
      // Configurações de saúde
      min_uptime: '10s',
      max_restarts: 10,
      
      // Configurações avançadas
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Variáveis de ambiente específicas para produção
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Adicionar outras variáveis conforme necessário
      },
      
      // Variáveis de ambiente para desenvolvimento
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        // Adicionar outras variáveis conforme necessário
      }
    }
  ],
  
  // Configurações de deploy
  deploy: {
    production: {
      user: 'deploy',
      host: ['production.agrocredito.ao'],
      ref: 'origin/main',
      repo: 'https://github.com/seu-usuario/agrocredito_dev.git',
      path: '/var/www/agrocredito',
      'post-deploy': 'npm ci --production && npm run build && npm run db:push && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    
    staging: {
      user: 'deploy',
      host: ['staging.agrocredito.ao'],
      ref: 'origin/develop',
      repo: 'https://github.com/seu-usuario/agrocredito_dev.git',
      path: '/var/www/agrocredito-staging',
      'post-deploy': 'npm ci --production && npm run build && npm run db:push && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': 'apt update && apt install git -y',
      env: {
        NODE_ENV: 'staging',
        PORT: 5001
      }
    }
  }
};