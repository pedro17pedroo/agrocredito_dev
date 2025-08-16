@echo off
setlocal enabledelayedexpansion

:: Configurações do MySQL
set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set MYSQL_USER=root
set MYSQL_PASSWORD=2003
set DB_NAME=agrocredito_dev

:: Verificar se o arquivo de backup foi especificado
if "%~1"=="" (
    echo Por favor, especifique o caminho do arquivo de backup
    echo Uso: restore.bat [caminho_para_backup.sql]
    pause
    exit /b 1
)

set "BACKUP_FILE=%~1"

:: Verificar se o arquivo de backup existe
if not exist "%BACKUP_FILE%" (
    echo Arquivo de backup nao encontrado: %BACKUP_FILE%
    pause
    exit /b 1
)

echo Verificando conexao com o MySQL...
"%MYSQL_PATH%" -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 'Conexao com MySQL bem-sucedida' AS status;"

if errorlevel 1 (
    echo Erro ao conectar ao MySQL. Verifique as credenciais e se o servidor esta em execucao.
    pause
    exit /b 1
)

echo Criando banco de dados se nao existir...
"%MYSQL_PATH%" -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

echo Restaurando backup de %BACKUP_FILE% para o banco de dados %DB_NAME%...
"%MYSQL_PATH%" -u%MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% -e "source %BACKUP_FILE%"

if errorlevel 1 (
    echo Ocorreu um erro durante a restauracao.
) else (
    echo Restauracao concluida com sucesso!
)

pause
