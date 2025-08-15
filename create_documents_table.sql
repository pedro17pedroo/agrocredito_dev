CREATE TABLE IF NOT EXISTS `documents` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id` varchar(36) NOT NULL,
  `document_type` enum('bilhete_identidade', 'declaracao_soba', 'declaracao_administracao_municipal', 'comprovativo_actividade_agricola', 'atestado_residencia', 'outros') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `version` int DEFAULT 1 NOT NULL,
  `is_active` boolean DEFAULT true NOT NULL,
  `replaced_by_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`replaced_by_id`) REFERENCES `documents`(`id`)
);