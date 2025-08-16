# Script PowerShell para diagnosticar problemas de seed no Windows
# Compatível com Windows 10/11 e PowerShell 5.1+

Write-Host "🔍 Diagnóstico de Seeds - AgroCrédito Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se um comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar Node.js e npm
Write-Host "📋 Verificando ambiente..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
    exit 1
}

if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar arquivo .env
Write-Host ""
Write-Host "📁 Verificando configuração..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Verificar se DATABASE_URL existe
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "❌ DATABASE_URL não encontrada no .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
    if (Test-Path ".env.example") {
        Write-Host "💡 Copie .env.example para .env e configure as variáveis" -ForegroundColor Yellow
    }
}

# Verificar dependências
Write-Host ""
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules não encontrado" -ForegroundColor Red
    Write-Host "💡 Execute: npm install" -ForegroundColor Yellow
}

# Testar conexão com a base de dados
Write-Host ""
Write-Host "🔗 Testando conexão com a base de dados..." -ForegroundColor Yellow
try {
    $testResult = npm run db:test:win 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão com a base de dados bem-sucedida" -ForegroundColor Green
    } else {
        Write-Host "❌ Falha na conexão com a base de dados" -ForegroundColor Red
        Write-Host "📋 Detalhes do erro:" -ForegroundColor Yellow
        Write-Host $testResult -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao testar conexão" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Gray
}

# Verificar se as tabelas existem
Write-Host ""
Write-Host "📊 Verificando schema da base de dados..." -ForegroundColor Yellow
try {
    $pushResult = npm run db:push 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema da base de dados atualizado" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Possível problema com o schema" -ForegroundColor Yellow
        Write-Host "📋 Detalhes:" -ForegroundColor Yellow
        Write-Host $pushResult -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao verificar schema" -ForegroundColor Red
}

# Executar seed básico
Write-Host ""
Write-Host "🌱 Executando seed básico..." -ForegroundColor Yellow
try {
    $seedResult = npm run db:seed:win 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Seed básico executado com sucesso" -ForegroundColor Green
        Write-Host "📋 Output do seed:" -ForegroundColor Cyan
        Write-Host $seedResult -ForegroundColor White
    } else {
        Write-Host "❌ Falha no seed básico" -ForegroundColor Red
        Write-Host "📋 Detalhes do erro:" -ForegroundColor Yellow
        Write-Host $seedResult -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao executar seed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Gray
}

Write-Host ""
Write-Host "🏁 Diagnóstico concluído!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dicas para resolver problemas:" -ForegroundColor Yellow
Write-Host "1. Certifique-se de que o MySQL está a executar (Docker ou local)" -ForegroundColor White
Write-Host "2. Verifique as credenciais no arquivo .env" -ForegroundColor White
Write-Host "3. Execute 'npm run db:push' para criar/atualizar as tabelas" -ForegroundColor White
Write-Host "4. Para Docker: 'npm run docker:dev' ou 'docker-compose -f docker-compose.simple.yml up -d'" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para sair"