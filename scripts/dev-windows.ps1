# Script PowerShell para executar AgroCrédito no Windows
# Compatível com Windows 10/11 e PowerShell 5.1+

Write-Host "🌾 Iniciando AgroCrédito no Windows..." -ForegroundColor Green

# Função para verificar se um comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar se o Node.js está instalado
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    Write-Host "📥 Download: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se o npm está instalado
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm não encontrado. Por favor, instale o npm primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Mostrar versões
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ Arquivo .env não encontrado." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "📋 Copiando .env.example para .env..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Arquivo .env criado. Configure as variáveis antes de continuar." -ForegroundColor Green
    } else {
        Write-Host "❌ Arquivo .env.example não encontrado." -ForegroundColor Red
        Write-Host "💡 Crie manualmente o arquivo .env com as configurações necessárias." -ForegroundColor Yellow
    }
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências." -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
}

# Definir variáveis de ambiente
$env:NODE_ENV = "development"
$env:PORT = "5000"

Write-Host "✅ Ambiente configurado com sucesso!" -ForegroundColor Green
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host "🌐 A aplicação estará disponível em: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Para parar o servidor, pressione Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Executar o servidor
try {
    tsx server/index.ts
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao iniciar o servidor." -ForegroundColor Red
    Write-Host "💡 Verifique se todas as dependências estão instaladas: npm install" -ForegroundColor Yellow
    Write-Host "💡 Verifique se o arquivo .env está configurado corretamente." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
}