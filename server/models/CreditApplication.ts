import { eq, desc, and } from "drizzle-orm";
import { db } from "../db.js";
import { creditApplications, users, type CreditApplication, type InsertCreditApplication } from "../../shared/schema.js";

export class CreditApplicationModel {
  static async findById(id: string): Promise<CreditApplication | undefined> {
    const [application] = await db.select().from(creditApplications).where(eq(creditApplications.id, id));
    return application;
  }

  static async findByUserId(userId: string): Promise<CreditApplication[]> {
    return await db
      .select()
      .from(creditApplications)
      .where(eq(creditApplications.userId, userId))
      .orderBy(desc(creditApplications.createdAt));
  }

  static async findAll(): Promise<CreditApplication[]> {
    return await db
      .select()
      .from(creditApplications)
      .orderBy(desc(creditApplications.createdAt));
  }

  static async create(applicationData: InsertCreditApplication): Promise<CreditApplication> {
    const [application] = await db
      .insert(creditApplications)
      .values(applicationData)
      .returning();
    return application;
  }

  static async updateStatus(
    id: string, 
    status: "pending" | "under_review" | "approved" | "rejected", 
    rejectionReason?: string, 
    reviewerId?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (reviewerId) updateData.reviewedBy = reviewerId;
    if (status === "approved" && reviewerId) updateData.approvedBy = reviewerId;

    await db
      .update(creditApplications)
      .set(updateData)
      .where(eq(creditApplications.id, id));
  }

  static async findForFinancialInstitution(financialInstitutionId: string): Promise<{
    new: CreditApplication[];
    underReview: CreditApplication[];
    historical: CreditApplication[];
  }> {
    const newApplications = await db
      .select({
        id: creditApplications.id,
        userId: creditApplications.userId,
        creditProgramId: creditApplications.creditProgramId,
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
        documents: creditApplications.documents,
        documentTypes: creditApplications.documentTypes,
        createdAt: creditApplications.createdAt,
        updatedAt: creditApplications.updatedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          email: users.email,
          userType: users.userType,
        }
      })
      .from(creditApplications)
      .leftJoin(users, eq(creditApplications.userId, users.id))
      .where(eq(creditApplications.status, "pending"))
      .orderBy(desc(creditApplications.createdAt));

    const underReviewApplications = await db
      .select({
        id: creditApplications.id,
        userId: creditApplications.userId,
        creditProgramId: creditApplications.creditProgramId,
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
        documents: creditApplications.documents,
        documentTypes: creditApplications.documentTypes,
        createdAt: creditApplications.createdAt,
        updatedAt: creditApplications.updatedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          email: users.email,
          userType: users.userType,
        }
      })
      .from(creditApplications)
      .leftJoin(users, eq(creditApplications.userId, users.id))
      .where(and(
        eq(creditApplications.status, "under_review"),
        eq(creditApplications.reviewedBy, financialInstitutionId)
      ))
      .orderBy(desc(creditApplications.updatedAt));

    const historicalApplications = await db
      .select({
        id: creditApplications.id,
        userId: creditApplications.userId,
        creditProgramId: creditApplications.creditProgramId,
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
        documents: creditApplications.documents,
        documentTypes: creditApplications.documentTypes,
        createdAt: creditApplications.createdAt,
        updatedAt: creditApplications.updatedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          email: users.email,
          userType: users.userType,
        }
      })
      .from(creditApplications)
      .leftJoin(users, eq(creditApplications.userId, users.id))
      .where(eq(creditApplications.reviewedBy, financialInstitutionId))
      .orderBy(desc(creditApplications.updatedAt));

    return {
      new: newApplications,
      underReview: underReviewApplications,
      historical: historicalApplications,
    };
  }
}