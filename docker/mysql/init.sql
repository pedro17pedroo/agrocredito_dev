-- Script de inicialização da base de dados AgroCrédito
-- Este script é executado automaticamente quando o container MySQL é criado

-- Configurar charset e collation
ALTER DATABASE agrocredito CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar utilizador adicional para backups (opcional)
CREATE USER IF NOT EXISTS 'backup_user'@'%' IDENTIFIED BY 'backup_password';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON agrocredito.* TO 'backup_user'@'%';

-- Configurações de timezone
SET time_zone = '+01:00';

-- Configurações de sessão para melhor performance
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Log de inicialização
SELECT 'Base de dados AgroCrédito inicializada com sucesso!' AS status;
SELECT NOW() AS timestamp_inicializacao;
SELECT @@character_set_database AS charset_db;
SELECT @@collation_database AS collation_db;
SELECT @@time_zone AS timezone_db;