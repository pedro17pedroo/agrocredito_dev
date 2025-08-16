@echo off
REM Script para executar AgroCrédito no Windows
REM Compatível com Windows 10/11

echo 🌾 Iniciando AgroCrédito no Windows...

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Por favor, instale o npm primeiro.
    pause
    exit /b 1
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo ⚠️ Arquivo .env não encontrado.
    if exist ".env.example" (
        echo 📋 Copiando .env.example para .env...
        copy ".env.example" ".env"
        echo ✅ Arquivo .env criado. Configure as variáveis antes de continuar.
    ) else (
        echo ❌ Arquivo .env.example não encontrado.
        echo 💡 Crie manualmente o arquivo .env com as configurações necessárias.
    )
    pause
    exit /b 1
)

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências.
        pause
        exit /b 1
    )
)

REM Definir variáveis de ambiente
set NODE_ENV=development
set PORT=5000

echo ✅ Ambiente configurado com sucesso!
echo 🚀 Iniciando servidor de desenvolvimento...
echo 🌐 A aplicação estará disponível em: http://localhost:5000
echo.
echo 💡 Para parar o servidor, pressione Ctrl+C
echo.

REM Executar o servidor
tsx server/index.ts

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao iniciar o servidor.
    echo 💡 Verifique se todas as dependências estão instaladas: npm install
    echo 💡 Verifique se o arquivo .env está configurado corretamente.
    pause
)