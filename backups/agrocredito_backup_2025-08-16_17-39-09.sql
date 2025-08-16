-- MySQL dump gerado pelo AgroCrédito Backup (Windows)
-- Host: localhost    Database: agrocredito_dev
-- ------------------------------------------------------
-- Data do backup: 16/08/2025, 18:39:10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Estrutura da tabela `accounts`
--

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `application_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `financial_institution_id` varchar(36) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `outstanding_balance` decimal(15,2) NOT NULL,
  `monthly_payment` decimal(15,2) NOT NULL,
  `next_payment_date` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `accounts_application_id_credit_applications_id_fk` (`application_id`),
  KEY `accounts_user_id_users_id_fk` (`user_id`),
  KEY `accounts_financial_institution_id_users_id_fk` (`financial_institution_id`),
  CONSTRAINT `accounts_application_id_credit_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `credit_applications` (`id`),
  CONSTRAINT `accounts_financial_institution_id_users_id_fk` FOREIGN KEY (`financial_institution_id`) REFERENCES `users` (`id`),
  CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `accounts`
--

INSERT INTO `accounts` (`id`, `application_id`, `user_id`, `financial_institution_id`, `total_amount`, `outstanding_balance`, `monthly_payment`, `next_payment_date`, `is_active`, `created_at`, `updated_at`) VALUES
('87a4a176-2f21-426b-ac68-fc74155b6e72', 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', '7000000.00', '7000000.00', '0.00', NULL, 1, '2025-08-13 12:20:57', '2025-08-13 12:20:57');

--
-- Estrutura da tabela `credit_app_docs`
--

DROP TABLE IF EXISTS `credit_app_docs`;
CREATE TABLE `credit_app_docs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `application_id` varchar(36) NOT NULL,
  `document_id` varchar(36) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `credit_app_docs_application_id_credit_applications_id_fk` (`application_id`),
  KEY `credit_app_docs_document_id_documents_id_fk` (`document_id`),
  CONSTRAINT `credit_app_docs_application_id_credit_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `credit_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `credit_app_docs_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `credit_app_docs`
--

INSERT INTO `credit_app_docs` (`id`, `application_id`, `document_id`, `is_required`, `created_at`) VALUES
('233d130d-7425-4633-b801-93e7499bb1c1', '3396deb1-6955-4a07-8b55-65582af95a9d', 'cd1e63ed-2f4e-4465-924f-f0cb2c5b2859', 0, '2025-08-12 10:33:20'),
('2bf5f6ab-48c6-4272-a897-fea145e1bb58', 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', 'cd1e63ed-2f4e-4465-924f-f0cb2c5b2859', 0, '2025-08-12 14:05:02'),
('2fa69d82-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', '04747fc4-c96d-4dc6-8b2d-821118b2dd63', 1, '2025-08-12 10:43:30'),
('2fa69e0e-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', '13101786-da03-4870-b828-17388b1a7abc', 1, '2025-08-12 10:43:30'),
('2fa69e72-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', '482cbe1d-af91-4203-94ca-f9c859ca4716', 1, '2025-08-12 10:43:30'),
('2fa69ea4-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', '4b3b84c8-3764-4a8b-aacc-c95abd1c08a7', 1, '2025-08-12 10:43:30'),
('2fa69ed6-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', 'a3df9881-6cfe-4bd8-ab36-311f30361d80', 1, '2025-08-12 10:43:30'),
('2fa69f08-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', 'a818e0ca-3a99-4175-aeba-c2dc2d7760d8', 1, '2025-08-12 10:43:30'),
('2fa69fda-7769-11f0-b9f0-282338afc4c9', '3396deb1-6955-4a07-8b55-65582af95a9d', 'fdb55b1d-a7c4-4b8d-ab2f-25e8de2e360f', 1, '2025-08-12 10:43:30'),
('3423d846-81fd-4345-a2f1-73c9538640f1', 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', 'f445f237-3c06-44d1-9d8b-7a14d8c022d7', 0, '2025-08-12 14:05:02'),
('365d1797-e3b9-41ee-b2f8-50ce1a746a57', 'ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', '4b3b84c8-3764-4a8b-aacc-c95abd1c08a7', 0, '2025-08-12 09:56:34'),
('37027808-6ca5-460e-8060-794410b5dbb1', 'd020184e-477b-4305-9923-a28203354c65', 'f27e5ab2-c4f7-4580-85c5-7c0830481ba4', 0, '2025-08-15 11:40:44'),
('3d34beec-89b7-4932-ab70-e0312e60579f', 'ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', 'a3df9881-6cfe-4bd8-ab36-311f30361d80', 0, '2025-08-12 09:56:34'),
('5c493122-f023-4fed-a9ee-f9ce6bfcd305', 'ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', '04747fc4-c96d-4dc6-8b2d-821118b2dd63', 0, '2025-08-12 09:56:34'),
('7b17d012-26f3-4b20-a73a-2f24da716aeb', 'ade47557-f372-4906-b2a0-64a1288f781a', 'cd1e63ed-2f4e-4465-924f-f0cb2c5b2859', 0, '2025-08-13 15:38:35'),
('7d3c4d8b-7101-4f3d-ab3f-1fe54e436f6a', '7a20232f-281a-49c6-a134-904fabeeb842', 'c1fe2719-fd11-417f-9f65-90754dd7066f', 0, '2025-08-12 14:00:20'),
('7f61511c-30c2-4a64-ae54-b984a8eccb8b', 'ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', 'fdb55b1d-a7c4-4b8d-ab2f-25e8de2e360f', 0, '2025-08-12 09:56:34'),
('816c1ab4-6ba7-40b3-ba9c-4eede41eb263', 'ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', 'a818e0ca-3a99-4175-aeba-c2dc2d7760d8', 0, '2025-08-12 09:56:34'),
('8db841a0-8fed-4155-903f-d2e9c754965b', 'ade47557-f372-4906-b2a0-64a1288f781a', 'f27e5ab2-c4f7-4580-85c5-7c0830481ba4', 0, '2025-08-13 15:38:35'),
('90443f71-d4f6-4591-8a22-3d7a76958d29', 'd020184e-477b-4305-9923-a28203354c65', 'f445f237-3c06-44d1-9d8b-7a14d8c022d7', 0, '2025-08-15 11:40:44'),
('94b17f19-a070-4659-83a2-c3dec0fa4730', 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', 'c1fe2719-fd11-417f-9f65-90754dd7066f', 0, '2025-08-12 14:05:02'),
('96ef008c-401d-4121-8e3f-ef0b7bbd1b79', '3396deb1-6955-4a07-8b55-65582af95a9d', 'f27e5ab2-c4f7-4580-85c5-7c0830481ba4', 0, '2025-08-12 10:33:20'),
('a871b61c-1c28-43c7-af3c-e7bc7bee3c09', 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', '1cafc020-7ebf-45fc-b764-330cc0f04488', 0, '2025-08-12 14:05:02'),
('b5f1489d-21ec-4615-bb33-a39c119dda24', 'd020184e-477b-4305-9923-a28203354c65', 'c1fe2719-fd11-417f-9f65-90754dd7066f', 0, '2025-08-15 11:40:44'),
('c0ff969e-cf89-41f4-a39a-720311047ba6', '7a20232f-281a-49c6-a134-904fabeeb842', '1cafc020-7ebf-45fc-b764-330cc0f04488', 0, '2025-08-12 14:00:20'),
('cf5d8319-7f0c-4950-be2f-7afb0fd1b4c4', 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', 'f27e5ab2-c4f7-4580-85c5-7c0830481ba4', 0, '2025-08-12 14:05:02'),
('d7ac46d6-5d26-4fcd-94bf-8e9fc0dd6072', '3396deb1-6955-4a07-8b55-65582af95a9d', 'f445f237-3c06-44d1-9d8b-7a14d8c022d7', 0, '2025-08-12 10:33:21'),
('e32a74ea-1256-4232-bcf7-ed165553f352', '3396deb1-6955-4a07-8b55-65582af95a9d', 'c1fe2719-fd11-417f-9f65-90754dd7066f', 0, '2025-08-12 10:33:21'),
('f633323e-c0d2-4add-af47-de7ad16a7146', '3396deb1-6955-4a07-8b55-65582af95a9d', '1cafc020-7ebf-45fc-b764-330cc0f04488', 0, '2025-08-12 10:33:21');

--
-- Estrutura da tabela `credit_applications`
--

DROP TABLE IF EXISTS `credit_applications`;
CREATE TABLE `credit_applications` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `credit_program_id` varchar(36) DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `project_type` enum('corn','cassava','cattle','poultry','horticulture','other') NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `term` int NOT NULL,
  `productivity` varchar(50) NOT NULL,
  `agriculture_type` varchar(255) NOT NULL,
  `credit_delivery_method` varchar(50) NOT NULL,
  `credit_guarantee_declaration` text NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `status` enum('pending','under_review','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text,
  `reviewed_by` varchar(36) DEFAULT NULL,
  `approved_by` varchar(36) DEFAULT NULL,
  `documents` text,
  `document_types` text,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  `monthly_income` decimal(15,2) NOT NULL DEFAULT '0.00',
  `expected_project_income` decimal(15,2) NOT NULL DEFAULT '0.00',
  `monthly_expenses` decimal(15,2) NOT NULL DEFAULT '0.00',
  `other_debts` decimal(15,2) DEFAULT '0.00',
  `family_members` int NOT NULL DEFAULT '1',
  `experience_years` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `credit_applications_user_id_users_id_fk` (`user_id`),
  KEY `credit_applications_credit_program_id_credit_programs_id_fk` (`credit_program_id`),
  KEY `credit_applications_reviewed_by_users_id_fk` (`reviewed_by`),
  KEY `credit_applications_approved_by_users_id_fk` (`approved_by`),
  CONSTRAINT `credit_applications_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `credit_applications_credit_program_id_credit_programs_id_fk` FOREIGN KEY (`credit_program_id`) REFERENCES `credit_programs` (`id`),
  CONSTRAINT `credit_applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `credit_applications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `credit_applications`
--

INSERT INTO `credit_applications` (`id`, `user_id`, `credit_program_id`, `project_name`, `project_type`, `description`, `amount`, `term`, `productivity`, `agriculture_type`, `credit_delivery_method`, `credit_guarantee_declaration`, `interest_rate`, `status`, `rejection_reason`, `reviewed_by`, `approved_by`, `documents`, `document_types`, `created_at`, `updated_at`, `monthly_income`, `expected_project_income`, `monthly_expenses`, `other_debts`, `family_members`, `experience_years`) VALUES
('1ee5fa44-7393-11f0-9dfe-62f08be7e6ca', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', NULL, 'Cultivo de Milho - Época das Chuvas', 'corn', 'Projeto para cultivo de 5 hectares de milho durante a época das chuvas. Incluí preparação do terreno, sementes melhoradas, fertilizantes e pesticidas. Expectativa de produção de 25 toneladas.', '750000.00', 12, 'medium', 'Agricultura de cereais - milho híbrido', 'monthly', 'Ofereço como garantia a hipoteca da propriedade agrícola de 8 hectares localizada na comuna do Kaculama, avaliada em AOA 1,200,000. Adicionalmente, disponibilizo o aval do Sr. António Manuel, comerciante na região.', NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '2025-08-07 13:33:36', '2025-08-07 13:33:36', '180000.00', '95000.00', '120000.00', '25000.00', 5, 8),
('1ee81f72-7393-11f0-9dfe-62f08be7e6ca', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', NULL, 'Criação de Gado Bovino', 'cattle', 'Aquisição de 10 cabeças de gado bovino para criação e reprodução. Inclui construção de curral, vacinação e alimentação para os primeiros 6 meses.', '2500000.00', 24, 'large', 'Pecuária bovina - criação e reprodução', 'total', 'Ofereço como garantia a hipoteca do terreno de 20 hectares com pastagens, localizado no município de Malanje, avaliado em AOA 4,000,000. Tenho também contrato de fornecimento com o frigorífico local como garantia adicional.', NULL, 'under_review', NULL, NULL, NULL, NULL, NULL, '2025-08-07 13:33:36', '2025-08-07 13:33:36', '320000.00', '150000.00', '180000.00', '45000.00', 7, 15),
('1ee89cea-7393-11f0-9dfe-62f08be7e6ca', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', NULL, 'Plantação de Mandioca', 'cassava', 'Cultivo de 3 hectares de mandioca. Projeto inclui preparação do solo, mudas, ferramentas agrícolas e mão-de-obra para plantio e colheita.', '450000.00', 18, 'small', 'Agricultura de tubérculos - mandioca', 'monthly', 'Apresento como garantia o penhor de equipamentos agrícolas (trator e alfaias) avaliados em AOA 650,000, além do aval solidário da Cooperativa Agrícola de Malanje.', NULL, 'approved', NULL, NULL, NULL, NULL, NULL, '2025-08-07 13:33:36', '2025-08-07 13:33:36', '125000.00', '65000.00', '85000.00', '15000.00', 4, 6),
('1ee8f992-7393-11f0-9dfe-62f08be7e6ca', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', NULL, 'Avicultura - Galinhas Poedeiras', 'poultry', 'Montagem de aviário para 200 galinhas poedeiras. Inclui construção do galinheiro, aquisição das aves, ração para os primeiros 3 meses e equipamentos.', '850000.00', 15, 'medium', 'Avicultura - produção de ovos', 'total', 'Ofereço como garantia a hipoteca da propriedade onde será construído o aviário, avaliada em AOA 1,100,000, e contrato de fornecimento de ovos com mercados locais.', NULL, 'rejected', NULL, NULL, NULL, NULL, NULL, '2025-08-07 13:33:36', '2025-08-07 13:33:36', '210000.00', '85000.00', '140000.00', '30000.00', 6, 10),
('1ee965bc-7393-11f0-9dfe-62f08be7e6ca', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', NULL, 'Horta Comunitária - Produtos Hortícolas', 'horticulture', 'Desenvolvimento de horta para produção de tomate, cebola, alface e pimento. Inclui sistema de irrigação, sementes, fertilizantes orgânicos e ferramentas.', '320000.00', 9, 'small', 'Horticultura - produtos frescos', 'total', 'Apresento como garantia equipamentos de irrigação e ferramentas agrícolas avaliados em AOA 400,000, além do aval do presidente da associação de agricultores locais.', NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '2025-08-07 13:33:36', '2025-08-07 13:33:36', '95000.00', '45000.00', '65000.00', '8000.00', 3, 4),
('3396deb1-6955-4a07-8b55-65582af95a9d', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '5539da66-7393-11f0-9dfe-62f08be7e6ca', 'Feijão Maluco', 'horticulture', 'xrtcfvygbhun dtcfvygbhjkn hgvjb', '5000000.00', 60, 'medium', 'Agricultura Familiar', 'monthly', 'cfgvhbjnk cfgvhbjknm vghbjkn', NULL, 'under_review', NULL, '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', NULL, NULL, NULL, '2025-08-12 10:33:20', '2025-08-13 11:20:20', '0.00', '0.00', '0.00', '0.00', 1, 0),
('7a20232f-281a-49c6-a134-904fabeeb842', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '55381a3c-7393-11f0-9dfe-62f08be7e6ca', 'Teste Associação Documentos', 'corn', 'Teste para verificar associação de documentos', '50000.00', 12, 'medium', 'Agricultura de cereais', 'total', 'Ofereço como garantia a hipoteca da propriedade agrícola localizada na comuna do Kaculama', NULL, 'rejected', 'Falta documento', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', NULL, NULL, NULL, '2025-08-12 14:00:20', '2025-08-13 11:21:30', '0.00', '0.00', '0.00', '0.00', 1, 0),
('ade47557-f372-4906-b2a0-64a1288f781a', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '5539da66-7393-11f0-9dfe-62f08be7e6ca', 'Pau Grande', 'other', 'bhfctgybh bvtyghuygtrf drftgyhuhytgf', '10000000.00', 60, 'medium', 'Agricultura Familiar', 'total', 'n bvchgdcfvgjbhkn nbvgcyfdryftgyihu bhvuutfgyihuo', NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '2025-08-13 15:38:35', '2025-08-13 15:38:35', '0.00', '0.00', '0.00', '0.00', 1, 0),
('ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '55381a3c-7393-11f0-9dfe-62f08be7e6ca', 'Cultivo de Mandioca', 'cassava', 'wasedrcftvbh xdcfvgbhnj xdcfvgbhnj xdcfvgbhn', '2000000.00', 24, 'medium', 'Agricultura Familiar', 'monthly', 'wasedrcfvgbh kjnhbgvfrdes dxrftvgbhj', NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '2025-08-12 09:56:34', '2025-08-12 09:56:34', '0.00', '0.00', '0.00', '0.00', 1, 0),
('d020184e-477b-4305-9923-a28203354c65', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '55381a3c-7393-11f0-9dfe-62f08be7e6ca', 'Arroz Branco', 'other', 'xdrctfvygbhunj ctfvygbhunj', '2000000.00', 24, 'small', 'Agricultura Familiar', 'total', 'rdtfyvgb fvygbuhnj cfvygbhn', NULL, 'under_review', NULL, '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', NULL, NULL, NULL, '2025-08-15 11:40:44', '2025-08-15 13:10:05', '150000.00', '500000.00', '100000.00', '0.00', 4, 5),
('d1836b15-c385-418f-88ac-30ef9ca3aae3', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '55381a3c-7393-11f0-9dfe-62f08be7e6ca', 'Arroz', 'other', 'sdfghjk fvgbhnjkm vgbhjk vgbhn', '10000000.00', 60, 'large', 'Agricultura Familiar', 'monthly', 'ffgh fhvgjbhkjnl fugyhijn dtryftgbhji', NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '2025-08-12 13:12:07', '2025-08-12 13:12:07', '0.00', '0.00', '0.00', '0.00', 1, 0),
('fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', '55381a3c-7393-11f0-9dfe-62f08be7e6ca', 'Melão', 'other', 'swedrftgyh dxcftvgybhjn fvtgyhunjkm fcvgbhjn cfgvbh', '7000000.00', 36, 'medium', 'Agricultura Familiar', 'total', 'sedrftvgbh ijhbgvfrd cfftgvbhnjijko gybhnjkml,', NULL, 'approved', NULL, '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', NULL, NULL, '2025-08-12 14:05:02', '2025-08-13 11:20:58', '0.00', '0.00', '0.00', '0.00', 1, 0);

--
-- Estrutura da tabela `credit_programs`
--

DROP TABLE IF EXISTS `credit_programs`;
CREATE TABLE `credit_programs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `financial_institution_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `project_types` text NOT NULL,
  `min_amount` decimal(15,2) NOT NULL,
  `max_amount` decimal(15,2) NOT NULL,
  `min_term` int NOT NULL,
  `max_term` int NOT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `effort_rate` decimal(5,2) NOT NULL,
  `processing_fee` decimal(5,2) DEFAULT '0.00',
  `requirements` text,
  `benefits` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `credit_programs_financial_institution_id_users_id_fk` (`financial_institution_id`),
  CONSTRAINT `credit_programs_financial_institution_id_users_id_fk` FOREIGN KEY (`financial_institution_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `credit_programs`
--

INSERT INTO `credit_programs` (`id`, `financial_institution_id`, `name`, `description`, `project_types`, `min_amount`, `max_amount`, `min_term`, `max_term`, `interest_rate`, `effort_rate`, `processing_fee`, `requirements`, `benefits`, `is_active`, `created_at`, `updated_at`) VALUES
('55381a3c-7393-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', 'AgriCredi Milho Plus', 'Programa especial para produtores de milho com condições diferenciadas. Taxa reduzida e prazo estendido para plantações de grande escala.', '["corn"]', '200000.00', '5000000.00', 6, 24, '12.50', '35.00', '2.50', '["Experiência mínima de 2 anos na cultura","Terreno próprio ou contrato de arrendamento","Plano de cultivo detalhado","Comprovativo de rendimentos"]', '["Taxa de juro preferencial","Carência de 6 meses para início dos pagamentos","Assistência técnica incluída","Seguro agrícola opcional"]', 1, '2025-08-07 13:35:07', '2025-08-07 13:35:07'),
('553967fc-7393-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', 'Pecuária Sustentável', 'Financiamento para projetos de pecuária bovina e caprina com foco na sustentabilidade e modernização das práticas de criação.', '["cattle"]', '1000000.00', '10000000.00', 12, 36, '15.00', '40.00', '3.00', '["Certificado de posse de terreno","Experiência comprovada em pecuária","Estudo de viabilidade do projeto","Garantias adequadas ao valor solicitado"]', '["Acompanhamento veterinário","Formação em técnicas modernas","Desconto na aquisição de rações","Apoio na comercialização"]', 1, '2025-08-07 13:35:07', '2025-08-07 13:35:07'),
('5539da66-7393-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', 'Jovem Agricultor', 'Programa dedicado a jovens empreendedores agrícolas entre 18-35 anos. Condições especiais para incentivar a juventude no setor agrícola.', '["corn","cassava","horticulture","poultry"]', '100000.00', '2000000.00', 6, 18, '10.00', '30.00', '1.50', '["Idade entre 18 e 35 anos","Formação ou experiência agrícola","Projeto inovador e sustentável","Residência na zona rural"]', '["Taxa de juro reduzida","Mentoria empresarial","Acesso a tecnologias modernas","Rede de contactos comerciais","Formação em gestão agrícola"]', 1, '2025-08-07 13:35:07', '2025-08-07 13:35:07'),
('553a19c2-7393-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', 'Horticultura Comercial', 'Financiamento para projetos de horticultura com foco na produção comercial e abastecimento dos mercados urbanos.', '["horticulture"]', '150000.00', '3000000.00', 6, 15, '13.50', '35.00', '2.00', '["Acesso garantido à água","Proximidade de mercados","Conhecimento em horticultura","Capacidade de escoamento da produção"]', '["Sementes certificadas subsidiadas","Sistema de irrigação","Apoio na comercialização","Contratos de fornecimento"]', 1, '2025-08-07 13:35:07', '2025-08-07 13:35:07'),
('553a43de-7393-11f0-9dfe-62f08be7e6ca', '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', 'Avicultura Moderna', 'Programa para modernização e expansão de projetos avícolas, incluindo galinhas poedeiras e frangos de carne.', '["poultry"]', '300000.00', '4000000.00', 9, 24, '14.00', '38.00', '2.50', '["Instalações adequadas","Conhecimento técnico avícola","Plano sanitário aprovado","Mercado definido para escoamento"]', '["Aves de raça melhorada","Ração balanceada","Assistência veterinária","Equipamentos modernos"]', 0, '2025-08-07 13:35:07', '2025-08-07 13:35:07');

--
-- Estrutura da tabela `documents`
--

DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `document_type` enum('bilhete_identidade','declaracao_soba','declaracao_administracao_municipal','comprovativo_actividade_agricola','atestado_residencia','outros') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `replaced_by_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `documents_user_id_users_id_fk` (`user_id`),
  CONSTRAINT `documents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `documents`
--

INSERT INTO `documents` (`id`, `user_id`, `document_type`, `file_name`, `original_file_name`, `file_path`, `file_size`, `mime_type`, `version`, `is_active`, `replaced_by_id`, `created_at`, `updated_at`) VALUES
('04747fc4-c96d-4dc6-8b2d-821118b2dd63', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'bilhete_identidade', '2d4d1dc1-7745-48f3-b1e0-fafc993913a6-1754992055168.pdf', 'relatorio-agricredit-2025-08-07.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/2d4d1dc1-7745-48f3-b1e0-fafc993913a6-1754992055168.pdf', 15517, 'application/pdf', 1, 0, NULL, '2025-08-12 09:47:35', '2025-08-12 09:47:35'),
('13101786-da03-4870-b828-17388b1a7abc', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'declaracao_soba', 'ef20c514-e692-4f1f-b26f-fed77c0fb1cc-1754991159660.pdf', 'test_doc.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/ef20c514-e692-4f1f-b26f-fed77c0fb1cc-1754991159660.pdf', 9, 'application/pdf', 1, 0, NULL, '2025-08-12 09:32:39', '2025-08-12 09:32:39'),
('1cafc020-7ebf-45fc-b764-330cc0f04488', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'declaracao_soba', 'f4ce6415-b6ad-4548-9701-a16600d3b418-1754994747325.pdf', 'EMPRESAS_CONSULTORAS_1754653570138.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/f4ce6415-b6ad-4548-9701-a16600d3b418-1754994747325.pdf', 48504, 'application/pdf', 1, 1, NULL, '2025-08-12 10:32:27', '2025-08-12 10:32:27'),
('482cbe1d-af91-4203-94ca-f9c859ca4716', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'bilhete_identidade', 'a24c27e5-9a07-4fb0-9e97-0c027884e169-1754991133459.pdf', 'test_document.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/a24c27e5-9a07-4fb0-9e97-0c027884e169-1754991133459.pdf', 158, 'application/pdf', 1, 0, NULL, '2025-08-12 09:32:13', '2025-08-12 09:32:13'),
('4b3b84c8-3764-4a8b-aacc-c95abd1c08a7', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'declaracao_soba', 'a58f9be0-8e5a-4aba-a54b-9d49b99648de-1754992092251.pdf', 'EMPRESAS_CONSULTORAS_1754653570138.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/a58f9be0-8e5a-4aba-a54b-9d49b99648de-1754992092251.pdf', 48504, 'application/pdf', 1, 0, NULL, '2025-08-12 09:48:12', '2025-08-12 09:48:12'),
('a3df9881-6cfe-4bd8-ab36-311f30361d80', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'declaracao_administracao_municipal', 'c28e365a-cbb9-4a08-8b96-5a8f6e8ca2ec-1754992116292.pdf', 'logs_1752432053670.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/c28e365a-cbb9-4a08-8b96-5a8f6e8ca2ec-1754992116292.pdf', 186272, 'application/pdf', 1, 0, NULL, '2025-08-12 09:48:36', '2025-08-12 09:48:36'),
('a818e0ca-3a99-4175-aeba-c2dc2d7760d8', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'comprovativo_actividade_agricola', 'fd46df61-daac-4094-8e85-628f6600893c-1754992128320.pdf', 'Guia 2.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/fd46df61-daac-4094-8e85-628f6600893c-1754992128320.pdf', 162610, 'application/pdf', 1, 0, NULL, '2025-08-12 09:48:48', '2025-08-12 09:48:48'),
('c1fe2719-fd11-417f-9f65-90754dd7066f', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'bilhete_identidade', '4d01e014-ef29-4595-8787-686df391aca7-1754994724821.pdf', 'relatorio-agricredit-2025-08-07.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/4d01e014-ef29-4595-8787-686df391aca7-1754994724821.pdf', 15517, 'application/pdf', 1, 1, NULL, '2025-08-12 10:32:04', '2025-08-12 10:32:04'),
('cd1e63ed-2f4e-4465-924f-f0cb2c5b2859', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'comprovativo_actividade_agricola', 'c900b25c-73cb-4f96-9d07-d17d16b98651-1754994769943.pdf', 'Guia 2.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/c900b25c-73cb-4f96-9d07-d17d16b98651-1754994769943.pdf', 162610, 'application/pdf', 1, 1, NULL, '2025-08-12 10:32:49', '2025-08-12 10:32:49'),
('f27e5ab2-c4f7-4580-85c5-7c0830481ba4', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'atestado_residencia', '1f0f98a2-37e2-4642-90a7-f41a763850af-1754994787136.pdf', 'logs_1752432053670.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/1f0f98a2-37e2-4642-90a7-f41a763850af-1754994787136.pdf', 186272, 'application/pdf', 1, 1, NULL, '2025-08-12 10:33:07', '2025-08-12 10:33:07'),
('f445f237-3c06-44d1-9d8b-7a14d8c022d7', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'declaracao_administracao_municipal', '290ae1e2-bea1-4d0b-8dde-77b5b88d41c4-1754994760146.pdf', 'DS-120 EspecificacÌ§aÌo TeÌcnica GeracÌ§aÌo e Consulta DC - v5.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/290ae1e2-bea1-4d0b-8dde-77b5b88d41c4-1754994760146.pdf', 1166113, 'application/pdf', 1, 1, NULL, '2025-08-12 10:32:40', '2025-08-12 10:32:40'),
('fdb55b1d-a7c4-4b8d-ab2f-25e8de2e360f', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'atestado_residencia', 'f3124462-68d4-4686-8357-5ba7cdbed201-1754992145704.pdf', 'relatorio-agricredit-2025-07-29.pdf', '/Users/pedrodivino/Dev/agrocredito_dev/uploads/documents/f3124462-68d4-4686-8357-5ba7cdbed201-1754992145704.pdf', 10065, 'application/pdf', 1, 0, NULL, '2025-08-12 09:49:05', '2025-08-12 09:49:05');

--
-- Estrutura da tabela `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `related_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_users_id_fk` (`user_id`),
  CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `is_read`, `related_id`, `created_at`, `updated_at`) VALUES
('0282e394-e729-4b24-bae1-88e5fa1d52a4', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Melão" foi enviada com sucesso e está sendo analisada.', 0, 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', '2025-08-12 14:05:02', '2025-08-12 14:05:02'),
('11c00b3c-2dfb-4458-bc7d-2ce35069f10a', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Cultivo de Mandioca" foi enviada com sucesso e está sendo analisada.', 0, 'ba2375d1-eaf9-4d21-9ab2-2df9c3f825e7', '2025-08-12 09:56:34', '2025-08-12 09:56:34'),
('1de2cb3c-dc78-49b8-b5e3-6ad81c2a0c56', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_rejected', 'Status da Solicitação Atualizado', 'Sua solicitação de crédito para "Teste Associação Documentos" foi rejeitada. Motivo: Falta documento', 0, '7a20232f-281a-49c6-a134-904fabeeb842', '2025-08-13 12:21:29', '2025-08-13 12:21:29'),
('2f3aeca9-5a3e-4211-8fc6-cddf24b4fb87', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_under_review', 'Status da Solicitação Atualizado', 'Sua solicitação de crédito para "Arroz Branco" está sendo analisada.', 0, 'd020184e-477b-4305-9923-a28203354c65', '2025-08-15 14:10:04', '2025-08-15 14:10:04'),
('403c6a12-fab7-4f4e-b98c-edeffb8da1a9', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Pau Grande" foi enviada com sucesso e está sendo analisada.', 0, 'ade47557-f372-4906-b2a0-64a1288f781a', '2025-08-13 15:38:35', '2025-08-13 15:38:35'),
('45ab159e-3937-460d-a9b1-63525fbbe73b', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_under_review', 'Status da Solicitação Atualizado', 'Sua solicitação de crédito para "Feijão Maluco" está sendo analisada.', 0, '3396deb1-6955-4a07-8b55-65582af95a9d', '2025-08-13 12:20:20', '2025-08-13 12:20:20'),
('49152aea-e8d3-4ba4-9541-0e55eac74af5', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Teste Associação Documentos" foi enviada com sucesso e está sendo analisada.', 0, '7a20232f-281a-49c6-a134-904fabeeb842', '2025-08-12 14:00:20', '2025-08-12 14:00:20'),
('8b86c3a9-3219-48b2-b7aa-5a7e8dcc359b', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_approved', 'Status da Solicitação Atualizado', 'Parabéns! Sua solicitação de crédito para "Melão" foi aprovada.', 0, 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', '2025-08-13 12:20:57', '2025-08-13 12:20:57'),
('a8b49efa-80f3-4b12-96b9-4924a5b9745d', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_under_review', 'Status da Solicitação Atualizado', 'Sua solicitação de crédito para "Teste Associação Documentos" está sendo analisada.', 0, '7a20232f-281a-49c6-a134-904fabeeb842', '2025-08-13 12:19:58', '2025-08-13 12:19:58'),
('adeac119-7da8-44c3-beca-58e3d58522d6', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Arroz Branco" foi enviada com sucesso e está sendo analisada.', 0, 'd020184e-477b-4305-9923-a28203354c65', '2025-08-15 11:40:44', '2025-08-15 11:40:44'),
('ce3984d8-64e2-45e1-968e-9358eba83071', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Arroz" foi enviada com sucesso e está sendo analisada.', 0, 'd1836b15-c385-418f-88ac-30ef9ca3aae3', '2025-08-12 13:12:07', '2025-08-12 13:12:07'),
('daf61152-d397-48d2-8bce-42d3c5b1c58b', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_submitted', 'Solicitação de Crédito Enviada', 'Sua solicitação de crédito para o projeto "Feijão Maluco" foi enviada com sucesso e está sendo analisada.', 0, '3396deb1-6955-4a07-8b55-65582af95a9d', '2025-08-12 10:33:21', '2025-08-12 10:33:21'),
('eef6dba9-e54f-48f8-9511-b9901bb80f40', '5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'application_under_review', 'Status da Solicitação Atualizado', 'Sua solicitação de crédito para "Melão" está sendo analisada.', 0, 'fa9a8266-58a6-49a4-bf8e-4afce9ab0a3f', '2025-08-13 12:19:45', '2025-08-13 12:19:45');

--
-- Estrutura da tabela `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `account_id` varchar(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_date` timestamp NULL DEFAULT (now()),
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `payments_account_id_accounts_id_fk` (`account_id`),
  CONSTRAINT `payments_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `payments`: tabela vazia
--

--
-- Estrutura da tabela `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `description` text,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `module`, `action`, `created_at`) VALUES
('5a82b708-7380-11f0-9dfe-62f08be7e6ca', 'users.create', 'Criar utilizadores', 'users', 'create', '2025-08-07 11:19:16'),
('5a839164-7380-11f0-9dfe-62f08be7e6ca', 'users.read', 'Ver utilizadores', 'users', 'read', '2025-08-07 11:19:16'),
('5a83dd18-7380-11f0-9dfe-62f08be7e6ca', 'users.update', 'Atualizar utilizadores', 'users', 'update', '2025-08-07 11:19:16'),
('5a8416a2-7380-11f0-9dfe-62f08be7e6ca', 'users.delete', 'Eliminar utilizadores', 'users', 'delete', '2025-08-07 11:19:16'),
('5a845752-7380-11f0-9dfe-62f08be7e6ca', 'applications.create', 'Criar solicitações de crédito', 'applications', 'create', '2025-08-07 11:19:16'),
('5a848754-7380-11f0-9dfe-62f08be7e6ca', 'applications.read', 'Ver solicitações de crédito', 'applications', 'read', '2025-08-07 11:19:16'),
('5a84a9dc-7380-11f0-9dfe-62f08be7e6ca', 'applications.update', 'Atualizar solicitações de crédito', 'applications', 'update', '2025-08-07 11:19:16'),
('5a84d1a0-7380-11f0-9dfe-62f08be7e6ca', 'applications.approve', 'Aprovar solicitações de crédito', 'applications', 'approve', '2025-08-07 11:19:16'),
('5a850012-7380-11f0-9dfe-62f08be7e6ca', 'applications.reject', 'Rejeitar solicitações de crédito', 'applications', 'reject', '2025-08-07 11:19:16'),
('5a852dee-7380-11f0-9dfe-62f08be7e6ca', 'accounts.create', 'Criar contas', 'accounts', 'create', '2025-08-07 11:19:16'),
('5a8563a4-7380-11f0-9dfe-62f08be7e6ca', 'accounts.read', 'Ver contas', 'accounts', 'read', '2025-08-07 11:19:16'),
('5a8588d4-7380-11f0-9dfe-62f08be7e6ca', 'accounts.update', 'Atualizar contas', 'accounts', 'update', '2025-08-07 11:19:16'),
('5a85b084-7380-11f0-9dfe-62f08be7e6ca', 'accounts.suspend', 'Suspender contas', 'accounts', 'suspend', '2025-08-07 11:19:16'),
('5a85d550-7380-11f0-9dfe-62f08be7e6ca', 'payments.create', 'Registrar pagamentos', 'payments', 'create', '2025-08-07 11:19:16'),
('5a865516-7380-11f0-9dfe-62f08be7e6ca', 'payments.read', 'Ver pagamentos', 'payments', 'read', '2025-08-07 11:19:16'),
('5a86d360-7380-11f0-9dfe-62f08be7e6ca', 'payments.update', 'Atualizar pagamentos', 'payments', 'update', '2025-08-07 11:19:16'),
('5a8705b0-7380-11f0-9dfe-62f08be7e6ca', 'reports.read', 'Ver relatórios', 'reports', 'read', '2025-08-07 11:19:16'),
('5a872540-7380-11f0-9dfe-62f08be7e6ca', 'reports.export', 'Exportar relatórios', 'reports', 'export', '2025-08-07 11:19:16'),
('5a877270-7380-11f0-9dfe-62f08be7e6ca', 'admin.profiles', 'Gerir perfis', 'admin', 'profiles', '2025-08-07 11:19:16'),
('5a87a24a-7380-11f0-9dfe-62f08be7e6ca', 'admin.permissions', 'Gerir permissões', 'admin', 'permissions', '2025-08-07 11:19:16'),
('5a87d83c-7380-11f0-9dfe-62f08be7e6ca', 'admin.system', 'Configurações do sistema', 'admin', 'system', '2025-08-07 11:19:16'),
('5a87f678-7380-11f0-9dfe-62f08be7e6ca', 'notifications.read', 'Ver notificações', 'notifications', 'read', '2025-08-07 11:19:16'),
('5a881248-7380-11f0-9dfe-62f08be7e6ca', 'notifications.create', 'Criar notificações', 'notifications', 'create', '2025-08-07 11:19:16');

--
-- Estrutura da tabela `profile_permissions`
--

DROP TABLE IF EXISTS `profile_permissions`;
CREATE TABLE `profile_permissions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `profile_id` varchar(36) NOT NULL,
  `permission_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `profile_permissions_profile_id_profiles_id_fk` (`profile_id`),
  KEY `profile_permissions_permission_id_permissions_id_fk` (`permission_id`),
  CONSTRAINT `profile_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `profile_permissions_profile_id_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `profile_permissions`
--

INSERT INTO `profile_permissions` (`id`, `profile_id`, `permission_id`, `created_at`) VALUES
('5a897b06-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a82b708-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a89aa86-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a839164-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a89d042-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a83dd18-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8a006c-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a8416a2-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8a26b4-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a845752-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8a524c-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a848754-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8a678c-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a84a9dc-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8a899c-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a84d1a0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8aadd2-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a850012-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8acbbe-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a852dee-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8ae860-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a8563a4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8b0462-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a8588d4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8b1efc-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a85b084-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8b3842-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a85d550-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8b5264-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a865516-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8b6eca-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a86d360-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8b8914-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a8705b0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8ba2c8-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a872540-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8bb9fc-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a877270-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8bd374-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a87a24a-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8bee4a-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a87d83c-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8c081c-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a87f678-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8c2220-7380-11f0-9dfe-62f08be7e6ca', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', '5a881248-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8c61b8-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a839164-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8c8134-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a848754-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8c9692-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a84d1a0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8cac36-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a850012-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8cc1a8-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a852dee-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8cd5bc-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a8563a4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8cee4e-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a8588d4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d0564-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a85b084-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d1d6a-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a865516-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d30b6-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a86d360-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d43b2-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a8705b0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d5b04-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a872540-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d6f54-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a87f678-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d82c8-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a881248-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8d9ae2-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a877270-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8db0b8-7380-11f0-9dfe-62f08be7e6ca', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', '5a87a24a-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8de8a8-7380-11f0-9dfe-62f08be7e6ca', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', '5a845752-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8e04d2-7380-11f0-9dfe-62f08be7e6ca', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', '5a848754-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8e2868-7380-11f0-9dfe-62f08be7e6ca', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', '5a8563a4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8e3aec-7380-11f0-9dfe-62f08be7e6ca', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', '5a865516-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8e51d0-7380-11f0-9dfe-62f08be7e6ca', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', '5a8705b0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8e7336-7380-11f0-9dfe-62f08be7e6ca', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', '5a87f678-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8ea7b6-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a845752-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8eb83c-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a848754-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8ec8d6-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a84a9dc-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8ee33e-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a8563a4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8ef5d6-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a85d550-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f0602-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a865516-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f1818-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a8705b0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f288a-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a872540-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f3960-7380-11f0-9dfe-62f08be7e6ca', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', '5a87f678-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f6228-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a845752-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f722c-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a848754-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f85c8-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a84a9dc-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8f9734-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a8563a4-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8fa83c-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a85d550-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8fbac0-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a865516-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8fc9e8-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a8705b0-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8fd8de-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a872540-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16'),
('5a8fe8e2-7380-11f0-9dfe-62f08be7e6ca', '5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', '5a87f678-7380-11f0-9dfe-62f08be7e6ca', '2025-08-07 11:19:16');

--
-- Estrutura da tabela `profiles`
--

DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `is_system` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `profiles`
--

INSERT INTO `profiles` (`id`, `name`, `description`, `is_active`, `is_system`, `created_at`, `updated_at`) VALUES
('5a8934de-7380-11f0-9dfe-62f08be7e6ca', 'Administrador', 'Acesso total ao sistema', 1, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', 'Instituição Financeira', 'Perfil para instituições financeiras', 1, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', 'Agricultor', 'Perfil para agricultores individuais', 1, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5a8e8416-7380-11f0-9dfe-62f08be7e6ca', 'Empresa Agrícola', 'Perfil para empresas agrícolas', 1, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5a8f49dc-7380-11f0-9dfe-62f08be7e6ca', 'Cooperativa', 'Perfil para cooperativas agrícolas', 1, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16');

--
-- Estrutura da tabela `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `full_name` varchar(255) NOT NULL,
  `bi` varchar(50) NOT NULL,
  `nif` varchar(50) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` text NOT NULL,
  `user_type` enum('farmer','company','cooperative','financial_institution','admin') NOT NULL,
  `profile_id` varchar(36) DEFAULT NULL,
  `parent_institution_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT (now()),
  `updated_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_bi_unique` (`bi`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_profile_id_profiles_id_fk` (`profile_id`),
  CONSTRAINT `users_profile_id_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dados da tabela `users`
--

INSERT INTO `users` (`id`, `full_name`, `bi`, `nif`, `phone`, `email`, `password`, `user_type`, `profile_id`, `parent_institution_id`, `is_active`, `created_at`, `updated_at`) VALUES
('1c617e86-3167-469d-aa38-05153df01633', 'Pedro', '002374382LA010', NULL, '+244 922 222 222', 'pedro@gmail.com', '$2b$10$XETCXdJrgHTKdERUkhgwguvqutubFNJHCqW2uM.zKmds7o5Hfyypu', 'farmer', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', NULL, 1, '2025-08-15 20:31:14', '2025-08-15 20:31:14'),
('5a9a5e26-7380-11f0-9dfe-62f08be7e6ca', 'Administrador do Sistema', '000000000LA000', NULL, '+244900000000', 'admin@agricredit.ao', '$2b$10$J9Er2Q7m506FGIzzbYBIKesrIZgPOIpscWeTEWNUHDEM1V4XZr27y', 'admin', '5a8934de-7380-11f0-9dfe-62f08be7e6ca', NULL, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5aa4ab10-7380-11f0-9dfe-62f08be7e6ca', 'João Manuel dos Santos', '001234567LA041', '5417037682', '+244923456789', 'joao.santos@gmail.com', '$2b$10$7CV92iSPZMIBx4SAz.VuduQH5g2RXupNB4zShqKwlUIMdQb0JQCCm', 'farmer', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', NULL, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5aaf93c2-7380-11f0-9dfe-62f08be7e6ca', 'Maria Fernanda Silva', '002345678LA042', '5417037683', '+244934567890', 'maria.silva@bai.ao', '$2b$10$qhbujPMxeqIK7ixJ1B7O3egZPQGO4dURj.EJBwcM21fQ8LBWROPPO', 'financial_institution', '5a8c3ed6-7380-11f0-9dfe-62f08be7e6ca', NULL, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('5aba1112-7380-11f0-9dfe-62f08be7e6ca', 'Carlos Eduardo Mendes', '003456789LA043', '5417037684', '+244945678901', 'carlos.mendes@agroangola.ao', '$2b$10$8Jvgh8IynbNdnvP2t6OI3Ouj8tKOcuQXiEd/20eLVsF7AxgkWfFN.', 'company', '5a8e8416-7380-11f0-9dfe-62f08be7e6ca', NULL, 1, '2025-08-07 11:19:16', '2025-08-07 11:19:16'),
('9ca8fca2-5864-4995-ba3b-fffb1952dff1', 'Pedro', '002374892LA010', NULL, '+244 922 222 221', 'pedro1@gmail.com', '$2b$10$p/S5tQqdXQQVo4Cl9RCYkewup7zLPSKopvP6XYabB6L4hXO8mROIa', 'farmer', '5a8dc33c-7380-11f0-9dfe-62f08be7e6ca', NULL, 1, '2025-08-15 21:02:48', '2025-08-15 21:02:48');

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
