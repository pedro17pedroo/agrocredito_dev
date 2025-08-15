import { eq, desc, and } from "drizzle-orm";
import { db } from "../db.js";
import { creditApplications, users, type CreditApplication, type InsertCreditApplication } from "../../shared/schema.js";

export class CreditApplicationModel {
  static async findById(id: string): Promise<CreditApplication | undefined> {
    const [application] = await db.select().from(creditApplications).where(eq(creditApplications.id, id));
    return application;
  }

  static async findByIdWithUser(id: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        // Credit application fields
        id: creditApplications.id,
        userId: creditApplications.userId,
        creditProgramId: creditApplications.creditProgramId,
        projectName: creditApplications.projectName,
        projectType: creditApplications.projectType,
        description: creditApplications.description,
        amount: creditApplications.amount,
        term: creditApplications.term,
        productivity: creditApplications.productivity,
        agricultureType: creditApplications.agricultureType,
        creditDeliveryMethod: creditApplications.creditDeliveryMethod,
        creditGuaranteeDeclaration: creditApplications.creditGuaranteeDeclaration,
        // Financial fields
        monthlyIncome: creditApplications.monthlyIncome,
        expectedProjectIncome: creditApplications.expectedProjectIncome,
        monthlyExpenses: creditApplications.monthlyExpenses,
        otherDebts: creditApplications.otherDebts,
        familyMembers: creditApplications.familyMembers,
        experienceYears: creditApplications.experienceYears,
        // Status and metadata
        status: creditApplications.status,
        rejectionReason: creditApplications.rejectionReason,
        reviewedBy: creditApplications.reviewedBy,
        approvedBy: creditApplications.approvedBy,
        createdAt: creditApplications.createdAt,
        updatedAt: creditApplications.updatedAt,
        // User fields
        userFullName: users.fullName,
        userPhone: users.phone,
        userEmail: users.email,
        userType: users.userType,
      })
      .from(creditApplications)
      .leftJoin(users, eq(creditApplications.userId, users.id))
      .where(eq(creditApplications.id, id));

    if (!result) {
      return undefined;
    }

    // Transform the flat result into nested structure
    return {
      id: result.id,
      userId: result.userId,
      creditProgramId: result.creditProgramId,
      projectName: result.projectName,
      projectType: result.projectType,
      description: result.description,
      amount: result.amount,
      term: result.term,
      productivity: result.productivity,
      agricultureType: result.agricultureType,
      creditDeliveryMethod: result.creditDeliveryMethod,
      guaranteeDescription: result.creditGuaranteeDeclaration,
      monthlyIncome: result.monthlyIncome,
      expectedProjectIncome: result.expectedProjectIncome,
      monthlyExpenses: result.monthlyExpenses,
      otherDebts: result.otherDebts,
      familyMembers: result.familyMembers,
      experienceYears: result.experienceYears,
      status: result.status,
      rejectionReason: result.rejectionReason,
      reviewedBy: result.reviewedBy,
      approvedBy: result.approvedBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      user: {
         id: result.userId,
         fullName: result.userFullName,
         phone: result.userPhone,
         email: result.userEmail,
         userType: result.userType,
       }
    };
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
    // Generate a unique ID for the application
    const { randomUUID } = await import('crypto');
    const applicationId = randomUUID();
    
    const applicationDataWithId = {
      ...applicationData,
      id: applicationId
    };

    await db
      .insert(creditApplications)
      .values(applicationDataWithId);

    // Fetch the created application using the generated ID
    const [application] = await db
      .select()
      .from(creditApplications)
      .where(eq(creditApplications.id, applicationId))
      .limit(1);

    if (!application) {
      throw new Error('Falha ao criar aplicação de crédito');
    }

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
    new: any[];
    underReview: any[];
    historical: any[];
  }> {
    const selectFields = {
      // Credit application fields
      id: creditApplications.id,
      userId: creditApplications.userId,
      creditProgramId: creditApplications.creditProgramId,
      projectName: creditApplications.projectName,
      projectType: creditApplications.projectType,
      description: creditApplications.description,
      amount: creditApplications.amount,
      term: creditApplications.term,
      productivity: creditApplications.productivity,
      agricultureType: creditApplications.agricultureType,
      creditDeliveryMethod: creditApplications.creditDeliveryMethod,
      creditGuaranteeDeclaration: creditApplications.creditGuaranteeDeclaration,
      // Financial fields
      monthlyIncome: creditApplications.monthlyIncome,
      expectedProjectIncome: creditApplications.expectedProjectIncome,
      monthlyExpenses: creditApplications.monthlyExpenses,
      otherDebts: creditApplications.otherDebts,
      familyMembers: creditApplications.familyMembers,
      experienceYears: creditApplications.experienceYears,
      interestRate: creditApplications.interestRate,
      status: creditApplications.status,
      rejectionReason: creditApplications.rejectionReason,
      reviewedBy: creditApplications.reviewedBy,
      approvedBy: creditApplications.approvedBy,
      documents: creditApplications.documents,
      documentTypes: creditApplications.documentTypes,
      createdAt: creditApplications.createdAt,
      updatedAt: creditApplications.updatedAt,
      // User fields
      userFullName: users.fullName,
      userBi: users.bi,
      userNif: users.nif,
      userPhone: users.phone,
      userEmail: users.email,
      userType: users.userType,
    };

    const newApplications = await db
      .select(selectFields)
      .from(creditApplications)
      .innerJoin(users, eq(creditApplications.userId, users.id))
      .where(eq(creditApplications.status, "pending"))
      .orderBy(desc(creditApplications.createdAt));

    const underReviewApplications = await db
      .select(selectFields)
      .from(creditApplications)
      .innerJoin(users, eq(creditApplications.userId, users.id))
      .where(and(
        eq(creditApplications.status, "under_review"),
        eq(creditApplications.reviewedBy, financialInstitutionId)
      ))
      .orderBy(desc(creditApplications.updatedAt));

    const historicalApplications = await db
      .select(selectFields)
      .from(creditApplications)
      .innerJoin(users, eq(creditApplications.userId, users.id))
      .where(eq(creditApplications.reviewedBy, financialInstitutionId))
      .orderBy(desc(creditApplications.updatedAt));

    // Transform the results to include user data in a nested structure
    const transformResults = (results: any[]) => {
      return results.map(result => ({
        id: result.id,
        userId: result.userId,
        creditProgramId: result.creditProgramId,
        projectName: result.projectName,
        projectType: result.projectType,
        description: result.description,
        amount: result.amount,
        term: result.term,
        productivity: result.productivity,
        agricultureType: result.agricultureType,
        creditDeliveryMethod: result.creditDeliveryMethod,
        creditGuaranteeDeclaration: result.creditGuaranteeDeclaration,
        // Financial fields
        monthlyIncome: result.monthlyIncome,
        expectedProjectIncome: result.expectedProjectIncome,
        monthlyExpenses: result.monthlyExpenses,
        otherDebts: result.otherDebts,
        familyMembers: result.familyMembers,
        experienceYears: result.experienceYears,
        interestRate: result.interestRate,
        status: result.status,
        rejectionReason: result.rejectionReason,
        reviewedBy: result.reviewedBy,
        approvedBy: result.approvedBy,
        documents: result.documents,
        documentTypes: result.documentTypes,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        user: {
          id: result.userId,
          fullName: result.userFullName,
          bi: result.userBi,
          nif: result.userNif,
          phone: result.userPhone,
          email: result.userEmail,
          userType: result.userType,
        }
      }));
    };

    return {
      new: transformResults(newApplications),
      underReview: transformResults(underReviewApplications),
      historical: transformResults(historicalApplications),
    };
  }
}