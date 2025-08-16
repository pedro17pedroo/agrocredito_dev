# Script para restaurar backup MySQL localmente
# Uso: .\restore-local.ps1 [caminho_do_arquivo_backup.sql]

# Configurações do MySQL
$mysqlUser = "root"
$mysqlPassword = "2003"
$mysqlDatabase = "agrocredito_dev"
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Verificar se o MySQL está em execução
$mysqlProcess = Get-Process -Name mysqld -ErrorAction SilentlyContinue
if (-not $mysqlProcess) {
    Write-Host "[ERRO] O servidor MySQL não está em execução." -ForegroundColor Red
    Write-Host "Por favor, inicie o serviço MySQL e tente novamente."
    exit 1
}

# Verificar se o caminho do MySQL está correto
if (-not (Test-Path $mysqlPath)) {
    Write-Host "[ERRO] MySQL não encontrado em: $mysqlPath" -ForegroundColor Red
    Write-Host "Por favor, verifique se o MySQL está instalado corretamente."
    exit 1
}

# Verificar se o arquivo de backup foi especificado
$backupFile = $args[0]
if (-not $backupFile) {
    Write-Host "[ERRO] Por favor, especifique o caminho do arquivo de backup" -ForegroundColor Red
    Write-Host "Uso: .\restore-local.ps1 [caminho_do_arquivo_backup.sql]"
    exit 1
}

# Verificar se o arquivo de backup existe
if (-not (Test-Path $backupFile)) {
    Write-Host "[ERRO] Arquivo de backup não encontrado: $backupFile" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Iniciando restauração do banco de dados..." -ForegroundColor Cyan
Write-Host "[INFO] MySQL: $mysqlPath"
Write-Host "[INFO] Arquivo: $backupFile"
Write-Host "[INFO] Banco de dados: $mysqlDatabase"

# Criar o banco de dados se não existir
$createDbCommand = "`"$mysqlPath`" -u $mysqlUser -p"$mysqlPassword" -e \"CREATE DATABASE IF NOT EXISTS $mysqlDatabase;\""

# Comando para restaurar o backup
$restoreCommand = "`"$mysqlPath`" -u $mysqlUser -p"$mysqlPassword" $mysqlDatabase < `"$backupFile`""

# Criar arquivo de lote temporário
$batchFile = [System.IO.Path]::GetTempFileName() + ".bat"
Remove-Item $batchFile -ErrorAction SilentlyContinue

# Escrever comandos no arquivo de lote
@(
    "@echo off",
    "echo Criando banco de dados se não existir...",
    $createDbCommand,
    "echo Restaurando backup...",
    $restoreCommand,
    "echo Restauração concluída.",
    "pause"
) | Out-File -FilePath $batchFile -Encoding ASCII

Write-Host "[INFO] Executando restauração..." -ForegroundColor Yellow

# Executar o arquivo de lote
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$batchFile`"" -Wait -NoNewWindow

# Limpar arquivo de lote temporário
Remove-Item $batchFile -Force -ErrorAction SilentlyContinue

Write-Host "[INFO] Processo concluído." -ForegroundColor Green
