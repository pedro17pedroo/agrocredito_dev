import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, decimal, timestamp, int, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profiles table for role management
export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false), // System profiles cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table
export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 50 }).notNull(), // e.g., 'applications', 'accounts', 'reports', 'admin'
  action: varchar("action", { length: 50 }).notNull(), // e.g., 'create', 'read', 'update', 'delete', 'approve'
  createdAt: timestamp("created_at").defaultNow(),
});

// Profile permissions junction table
export const profilePermissions = mysqlTable("profile_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  profileId: varchar("profile_id", { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  permissionId: varchar("permission_id", { length: 36 }).notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  bi: varchar("bi", { length: 50 }).notNull().unique(), // Bilhete de Identidade
  nif: varchar("nif", { length: 50 }), // NIF is optional
  phone: varchar("phone", { length: 20 }).notNull().unique(), // Angola phone format
  email: varchar("email", { length: 255 }).unique(), // Email is optional
  password: text("password").notNull(),
  userType: mysqlEnum("user_type", ["farmer", "company", "cooperative", "financial_institution", "admin"]).notNull(),
  profileId: varchar("profile_id", { length: 36 }).references(() => profiles.id), // Link to profile for permissions
  parentInstitutionId: varchar("parent_institution_id", { length: 36 }), // For internal users of financial institutions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit programs table - managed by financial institutions
export const creditPrograms = mysqlTable("credit_programs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  financialInstitutionId: varchar("financial_institution_id", { length: 36 }).notNull().references(() => users.id), // Which institution owns this program
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectTypes: text("project_types").notNull(), // JSON string of project types this program supports
  minAmount: decimal("min_amount", { precision: 15, scale: 2 }).notNull(), // Minimum loan amount in AOA
  maxAmount: decimal("max_amount", { precision: 15, scale: 2 }).notNull(), // Maximum loan amount in AOA
  minTerm: int("min_term").notNull(), // Minimum term in months
  maxTerm: int("max_term").notNull(), // Maximum term in months
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(), // Annual interest rate percentage
  effortRate: decimal("effort_rate", { precision: 5, scale: 2 }).notNull(), // Maximum effort rate (payment/income ratio) percentage
  processingFee: decimal("processing_fee", { precision: 5, scale: 2 }).default("0"), // Processing fee percentage
  requirements: text("requirements"), // JSON string of program requirements
  benefits: text("benefits"), // JSON string of program benefits
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit applications table
export const creditApplications = mysqlTable("credit_applications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  creditProgramId: varchar("credit_program_id", { length: 36 }).references(() => creditPrograms.id), // Link to the credit program used
  projectName: varchar("project_name", { length: 255 }).notNull(),
  projectType: mysqlEnum("project_type", ["corn", "cassava", "cattle", "poultry", "horticulture", "other"]).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // AOA amount
  term: int("term").notNull(), // months
  
  // New required fields for agricultural project details
  productivity: varchar("productivity", { length: 50 }).notNull(), // Pequeno/Medio/Grande Produtor
  agricultureType: varchar("agriculture_type", { length: 255 }).notNull(), // Horticultura, Pecuária, etc
  creditDeliveryMethod: varchar("credit_delivery_method", { length: 50 }).notNull(), // Entrega Total/Por Prestação Mensal
  creditGuaranteeDeclaration: text("credit_guarantee_declaration").notNull(), // Declaração da garantia
  
  // Financial information
  monthlyIncome: decimal("monthly_income", { precision: 15, scale: 2 }).default("0").notNull(), // Rendimento mensal atual em AOA
  expectedProjectIncome: decimal("expected_project_income", { precision: 15, scale: 2 }).default("0").notNull(), // Rendimento mensal esperado do projeto em AOA
  monthlyExpenses: decimal("monthly_expenses", { precision: 15, scale: 2 }).default("0").notNull(), // Despesas mensais em AOA
  otherDebts: decimal("other_debts", { precision: 15, scale: 2 }).default("0"), // Outras dívidas mensais em AOA
  familyMembers: int("family_members").default(1).notNull(), // Número de membros da família
  experienceYears: int("experience_years").default(0).notNull(), // Anos de experiência na agricultura
  
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }), // percentage
  status: mysqlEnum("status", ["pending", "under_review", "approved", "rejected"]).default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by", { length: 36 }).references(() => users.id), // Financial institution that reviewed this application
  approvedBy: varchar("approved_by", { length: 36 }).references(() => users.id), // Financial institution that approved this application
  
  // Document fields - different requirements for farmers vs companies
  documents: text("documents"), // JSON string of document URLs/paths
  documentTypes: text("document_types"), // JSON string describing what each document is
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accounts table for managing approved credits
export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  applicationId: varchar("application_id", { length: 36 }).notNull().references(() => creditApplications.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  financialInstitutionId: varchar("financial_institution_id", { length: 36 }).notNull().references(() => users.id), // Which institution approved and manages this account
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  outstandingBalance: decimal("outstanding_balance", { precision: 15, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 15, scale: 2 }).notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment history table
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  accountId: varchar("account_id", { length: 36 }).notNull().references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: varchar("related_id", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para gestão de documentos dos usuários
export const documents = mysqlTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  documentType: mysqlEnum("document_type", [
    "bilhete_identidade",
    "declaracao_soba", 
    "declaracao_administracao_municipal",
    "comprovativo_actividade_agricola",
    "atestado_residencia",
    "outros"
  ]).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: int("file_size").notNull(), // tamanho em bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  version: int("version").default(1).notNull(), // versão do documento
  isActive: boolean("is_active").default(true).notNull(), // documento ativo (última versão)
  replacedById: varchar("replaced_by_id", { length: 36 }), // referência ao documento que substituiu este
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de relacionamento entre aplicações de crédito e documentos
export const creditApplicationDocuments = mysqlTable("credit_app_docs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  applicationId: varchar("application_id", { length: 36 }).notNull().references(() => creditApplications.id, { onDelete: 'cascade' }),
  documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: 'cascade' }),
  isRequired: boolean("is_required").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertCreditApplicationSchema = createInsertSchema(creditApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rejectionReason: true,
  interestRate: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditProgramSchema = createInsertSchema(creditPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertProfilePermissionSchema = createInsertSchema(profilePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditApplicationDocumentSchema = createInsertSchema(creditApplicationDocuments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CreditApplication = typeof creditApplications.$inferSelect;
export type InsertCreditApplication = z.infer<typeof insertCreditApplicationSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type ProfilePermission = typeof profilePermissions.$inferSelect;
export type InsertProfilePermission = z.infer<typeof insertProfilePermissionSchema>;

export type CreditProgram = typeof creditPrograms.$inferSelect;
export type InsertCreditProgram = z.infer<typeof insertCreditProgramSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type CreditApplicationDocument = typeof creditApplicationDocuments.$inferSelect;
export type InsertCreditApplicationDocument = z.infer<typeof insertCreditApplicationDocumentSchema>;
