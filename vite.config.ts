import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    // Configuração do diretório raiz
    root: path.resolve(__dirname, 'client'),
    
    plugins: [
      react({
        // Configurações do React
        babel: {
          plugins: [
            // Plugins do Babel se necessário
          ],
        },
      }),
    ],
    
    // Configuração de resolução de módulos
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@server': path.resolve(__dirname, 'server'),
        '@components': path.resolve(__dirname, 'client/src/components'),
        '@pages': path.resolve(__dirname, 'client/src/pages'),
        '@hooks': path.resolve(__dirname, 'client/src/hooks'),
        '@utils': path.resolve(__dirname, 'client/src/utils'),
        '@lib': path.resolve(__dirname, 'client/src/lib'),
        '@types': path.resolve(__dirname, 'client/src/types'),
        '@assets': path.resolve(__dirname, 'client/src/assets'),
        '@styles': path.resolve(__dirname, 'client/src/styles'),
      },
    },
    
    // Configuração de CSS
    css: {
      postcss: './postcss.config.js',
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
      },
    },
    
    // Configuração de build
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: isDevelopment,
      minify: isProduction ? 'esbuild' : false,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar bibliotecas grandes em chunks separados
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['date-fns', 'clsx', 'tailwind-merge'],
          },
        },
      },
      // Configurações de otimização
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    
    // Configuração do servidor de desenvolvimento
    server: {
      port: parseInt(env.VITE_PORT || '3000'),
      host: env.VITE_HOST || 'localhost',
      open: env.VITE_OPEN === 'true',
      cors: true,
      proxy: {
        // Proxy para API do backend
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      fs: {
        strict: true,
        allow: ['..'],
      },
    },
    
    // Configuração de preview (para build de produção)
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: env.VITE_HOST || 'localhost',
      cors: true,
    },
    
    // Configuração de otimização de dependências
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'date-fns',
        'clsx',
        'tailwind-merge',
      ],
      exclude: [
        // Excluir dependências que causam problemas
      ],
    },
    
    // Configuração de variáveis de ambiente
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    
    // Configuração de base URL
    base: env.VITE_BASE_URL || '/',
    
    // Configuração de modo
    mode,
    
    // Configuração de logs
    logLevel: isDevelopment ? 'info' : 'warn',
    
    // Configuração de worker
    worker: {
      format: 'es',
    },
    
    // Configuração de JSON
    json: {
      namedExports: true,
      stringify: false,
    },
    
    // Configuração de assets
    assetsInclude: [
      '**/*.svg',
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.gif',
      '**/*.webp',
      '**/*.ico',
      '**/*.woff',
      '**/*.woff2',
      '**/*.ttf',
      '**/*.eot',
    ],
  };
});
