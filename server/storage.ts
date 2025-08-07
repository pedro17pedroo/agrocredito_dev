import { 
  users, 
  creditApplications, 
  accounts, 
  payments,
  notifications,
  profiles,
  permissions,
  profilePermissions,
  creditPrograms,
  type User, 
  type InsertUser,
  type CreditApplication,
  type InsertCreditApplication,
  type Account,
  type InsertAccount,
  type Payment,
  type InsertPayment,
  type Notification,
  type InsertNotification,
  type Profile,
  type InsertProfile,
  type Permission,
  type InsertPermission,
  type ProfilePermission,
  type InsertProfilePermission,
  type CreditProgram,
  type InsertCreditProgram
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// This storage file is now deprecated in favor of the new Model architecture
// The new models are located in the models/ directory:
// - UserModel (models/User.ts)
// - CreditApplicationModel (models/CreditApplication.ts)
// - AccountModel (models/Account.ts)
// - PaymentModel (models/Payment.ts)
// - NotificationModel (models/Notification.ts)
// - ProfileModel (models/Profile.ts)
// - PermissionModel (models/Profile.ts)

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Credit application operations
  createCreditApplication(application: InsertCreditApplication): Promise<CreditApplication>;
  getCreditApplicationsByUserId(userId: string): Promise<CreditApplication[]>;
  getAllCreditApplications(): Promise<CreditApplication[]>;
  getCreditApplicationById(id: string): Promise<CreditApplication | undefined>;
  updateCreditApplicationStatus(id: string, status: "pending" | "under_review" | "approved" | "rejected", rejectionReason?: string, reviewerId?: string): Promise<void>;
  getCreditApplicationsForFinancialInstitution(financialInstitutionId: string): Promise<{
    new: CreditApplication[];
    underReview: CreditApplication[];
    historical: CreditApplication[];
  }>;

  // Account operations
  createAccount(account: InsertAccount): Promise<Account>;
  getAccountsByUserId(userId: string): Promise<Account[]>;
  getAllAccounts(): Promise<Account[]>;
  getAccountsByFinancialInstitution(financialInstitutionId: string): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  updateAccountBalance(id: string, newBalance: number, nextPaymentDate?: Date): Promise<void>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByAccountId(accountId: string): Promise<Payment[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Profile operations
  createProfile(profile: InsertProfile): Promise<Profile>;
  getAllProfiles(): Promise<Profile[]>;
  getProfileById(id: string): Promise<Profile | undefined>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<void>;
  deleteProfile(id: string): Promise<void>;

  // Permission operations
  createPermission(permission: InsertPermission): Promise<Permission>;
  getAllPermissions(): Promise<Permission[]>;
  getPermissionById(id: string): Promise<Permission | undefined>;
  
  // Profile permission operations
  addPermissionToProfile(profileId: string, permissionId: string): Promise<void>;
  removePermissionFromProfile(profileId: string, permissionId: string): Promise<void>;
  getProfilePermissions(profileId: string): Promise<Permission[]>;
  getUserPermissions(userId: string): Promise<Permission[]>;

  // User profile operations
  assignProfileToUser(userId: string, profileId: string): Promise<void>;

  // Credit program operations
  createCreditProgram(program: InsertCreditProgram): Promise<CreditProgram>;
  getCreditProgramsByFinancialInstitution(financialInstitutionId: string): Promise<CreditProgram[]>;
  getCreditProgramById(id: string): Promise<CreditProgram | undefined>;
  updateCreditProgram(id: string, program: Partial<InsertCreditProgram>): Promise<void>;
  deleteCreditProgram(id: string): Promise<void>;
  toggleCreditProgramStatus(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Credit application operations
  async createCreditApplication(application: InsertCreditApplication): Promise<CreditApplication> {
    const [app] = await db
      .insert(creditApplications)
      .values({
        ...application,
        updatedAt: new Date(),
      })
      .returning();
    return app;
  }

  async getCreditApplicationsByUserId(userId: string): Promise<CreditApplication[]> {
    return await db
      .select()
      .from(creditApplications)
      .where(eq(creditApplications.userId, userId))
      .orderBy(desc(creditApplications.createdAt));
  }

  async getCreditApplicationById(id: string): Promise<CreditApplication | undefined> {
    const [app] = await db.select().from(creditApplications).where(eq(creditApplications.id, id));
    return app;
  }

  async getAllCreditApplications(): Promise<CreditApplication[]> {
    return await db
      .select({
        id: creditApplications.id,
        userId: creditApplications.userId,
        projectName: creditApplications.projectName,
        projectType: creditApplications.projectType,
        description: creditApplications.description,
        amount: creditApplications.amount,
        term: creditApplications.term,
        interestRate: creditApplications.interestRate,
        status: creditApplications.status,
        rejectionReason: creditApplications.rejectionReason,
        reviewedBy: creditApplications.reviewedBy,
        approvedBy: creditApplications.approvedBy,
        createdAt: creditApplications.createdAt,
        updatedAt: creditApplications.updatedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          email: users.email,
        }
      })
      .from(creditApplications)
      .leftJoin(users, eq(creditApplications.userId, users.id))
      .orderBy(desc(creditApplications.createdAt));
  }

  async updateCreditApplicationStatus(
    id: string, 
    status: "pending" | "under_review" | "approved" | "rejected", 
    rejectionReason?: string,
    reviewerId?: string
  ): Promise<void> {
    const updateData: any = { 
      status, 
      rejectionReason,
      updatedAt: new Date(),
    };

    if (reviewerId && status === "under_review") {
      updateData.reviewedBy = reviewerId;
    }

    if (reviewerId && status === "approved") {
      updateData.approvedBy = reviewerId;
    }

    await db
      .update(creditApplications)
      .set(updateData)
      .where(eq(creditApplications.id, id));
  }

  async getCreditApplicationsForFinancialInstitution(financialInstitutionId: string): Promise<{
    new: CreditApplication[];
    underReview: CreditApplication[];
    historical: CreditApplication[];
  }> {
    const allApplications = await db
      .select({
        id: creditApplications.id,
        userId: creditApplications.userId,
        projectName: creditApplications.projectName,
        projectType: creditApplications.projectType,
        description: creditApplications.description,
        amount: creditApplications.amount,
        term: creditApplications.term,
        interestRate: creditApplications.interestRate,
        status: creditApplications.status,
        rejectionReason: creditApplications.rejectionReason,
        reviewedBy: creditApplications.reviewedBy,
        approvedBy: creditApplications.approvedBy,
        createdAt: creditApplications.createdAt,
        updatedAt: creditApplications.updatedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          email: users.email,
        }
      })
      .from(creditApplications)
      .leftJoin(users, eq(creditApplications.userId, users.id))
      .orderBy(desc(creditApplications.createdAt));

    return {
      // New applications: pending and not reviewed by anyone OR not reviewed by this institution
      new: allApplications.filter(app => 
        app.status === "pending" && 
        (!app.approvedBy) // Not approved by any institution yet
      ),
      
      // Under review: applications this institution is reviewing
      underReview: allApplications.filter(app => 
        app.status === "under_review" && 
        app.reviewedBy === financialInstitutionId
      ),
      
      // Historical: applications this institution approved or rejected
      historical: allApplications.filter(app => 
        (app.status === "approved" && app.approvedBy === financialInstitutionId) ||
        (app.status === "rejected" && app.reviewedBy === financialInstitutionId)
      )
    };
  }

  // Account operations
  async createAccount(account: InsertAccount): Promise<Account> {
    const [acc] = await db
      .insert(accounts)
      .values({
        ...account,
        updatedAt: new Date(),
      })
      .returning();
    return acc;
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(desc(accounts.createdAt));
  }

  async getAllAccounts(): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .orderBy(desc(accounts.createdAt));
  }

  async getAccountsByFinancialInstitution(financialInstitutionId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.financialInstitutionId, financialInstitutionId), eq(accounts.isActive, true)))
      .orderBy(desc(accounts.createdAt));
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async updateAccountBalance(id: string, newBalance: number, nextPaymentDate?: Date): Promise<void> {
    const updateData: any = { 
      outstandingBalance: newBalance.toString(),
      updatedAt: new Date(),
    };
    
    if (nextPaymentDate) {
      updateData.nextPaymentDate = nextPaymentDate;
    }

    await db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.id, id));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [pay] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return pay;
  }

  async getPaymentsByAccountId(accountId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.accountId, accountId))
      .orderBy(desc(payments.paymentDate));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [notif] = await db
      .insert(notifications)
      .values({
        ...notification,
        updatedAt: new Date(),
      })
      .returning();
    return notif;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // Profile operations
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({
        ...insertProfile,
        updatedAt: new Date(),
      })
      .returning();
    return profile;
  }

  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles).orderBy(profiles.name);
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async updateProfile(id: string, updateData: Partial<InsertProfile>): Promise<void> {
    await db
      .update(profiles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(profiles.id, id));
  }

  async deleteProfile(id: string): Promise<void> {
    // Only allow deletion of non-system profiles
    await db
      .delete(profiles)
      .where(and(eq(profiles.id, id), eq(profiles.isSystem, false)));
  }

  // Permission operations
  async createPermission(insertPermission: InsertPermission): Promise<Permission> {
    const [permission] = await db
      .insert(permissions)
      .values(insertPermission)
      .returning();
    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions).orderBy(permissions.module, permissions.action);
  }

  async getPermissionById(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  // Profile permission operations
  async addPermissionToProfile(profileId: string, permissionId: string): Promise<void> {
    await db
      .insert(profilePermissions)
      .values({ profileId, permissionId })
      .onConflictDoNothing();
  }

  async removePermissionFromProfile(profileId: string, permissionId: string): Promise<void> {
    await db
      .delete(profilePermissions)
      .where(
        and(
          eq(profilePermissions.profileId, profileId),
          eq(profilePermissions.permissionId, permissionId)
        )
      );
  }

  async getProfilePermissions(profileId: string): Promise<Permission[]> {
    const result = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        module: permissions.module,
        action: permissions.action,
        createdAt: permissions.createdAt,
      })
      .from(profilePermissions)
      .innerJoin(permissions, eq(profilePermissions.permissionId, permissions.id))
      .where(eq(profilePermissions.profileId, profileId));
    
    return result;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const result = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        module: permissions.module,
        action: permissions.action,
        createdAt: permissions.createdAt,
      })
      .from(users)
      .innerJoin(profiles, eq(users.profileId, profiles.id))
      .innerJoin(profilePermissions, eq(profiles.id, profilePermissions.profileId))
      .innerJoin(permissions, eq(profilePermissions.permissionId, permissions.id))
      .where(eq(users.id, userId));
    
    return result;
  }

  // User profile operations
  async assignProfileToUser(userId: string, profileId: string): Promise<void> {
    await db
      .update(users)
      .set({ profileId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Credit program operations
  async createCreditProgram(program: InsertCreditProgram): Promise<CreditProgram> {
    const [creditProgram] = await db
      .insert(creditPrograms)
      .values({
        ...program,
        updatedAt: new Date(),
      })
      .returning();
    return creditProgram;
  }

  async getCreditProgramsByFinancialInstitution(financialInstitutionId: string): Promise<CreditProgram[]> {
    return await db
      .select()
      .from(creditPrograms)
      .where(eq(creditPrograms.financialInstitutionId, financialInstitutionId))
      .orderBy(desc(creditPrograms.createdAt));
  }

  async getCreditProgramById(id: string): Promise<CreditProgram | undefined> {
    const [program] = await db
      .select()
      .from(creditPrograms)
      .where(eq(creditPrograms.id, id));
    return program;
  }

  async updateCreditProgram(id: string, program: Partial<InsertCreditProgram>): Promise<void> {
    await db
      .update(creditPrograms)
      .set({
        ...program,
        updatedAt: new Date(),
      })
      .where(eq(creditPrograms.id, id));
  }

  async deleteCreditProgram(id: string): Promise<void> {
    await db.delete(creditPrograms).where(eq(creditPrograms.id, id));
  }

  async toggleCreditProgramStatus(id: string): Promise<void> {
    const program = await this.getCreditProgramById(id);
    if (program) {
      await db
        .update(creditPrograms)
        .set({
          isActive: !program.isActive,
          updatedAt: new Date(),
        })
        .where(eq(creditPrograms.id, id));
    }
  }
}

export const storage = new DatabaseStorage();
