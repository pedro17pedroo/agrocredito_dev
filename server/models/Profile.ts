import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { 
  profiles, 
  permissions, 
  profilePermissions, 
  users,
  type Profile, 
  type InsertProfile,
  type Permission,
  type InsertPermission,
  type InsertProfilePermission
} from "@shared/schema";

export class ProfileModel {
  static async findById(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  static async findByName(name: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.name, name));
    return profile;
  }

  static async findAll(): Promise<Profile[]> {
    return await db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.createdAt));
  }

  static async create(profileData: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(profileData)
      .returning();
    return profile;
  }

  static async update(id: string, profileData: Partial<InsertProfile>): Promise<void> {
    await db
      .update(profiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(profiles.id, id));
  }

  static async delete(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  static async getPermissions(profileId: string): Promise<Permission[]> {
    return await db
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
  }

  static async addPermission(profileId: string, permissionId: string): Promise<void> {
    await db.insert(profilePermissions).values({
      profileId,
      permissionId,
    });
  }

  static async removePermission(profileId: string, permissionId: string): Promise<void> {
    await db
      .delete(profilePermissions)
      .where(
        and(
          eq(profilePermissions.profileId, profileId),
          eq(profilePermissions.permissionId, permissionId)
        )
      );
  }

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    return await db
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
  }
}

export class PermissionModel {
  static async findById(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  static async findAll(): Promise<Permission[]> {
    return await db
      .select()
      .from(permissions)
      .orderBy(permissions.module, permissions.action);
  }

  static async create(permissionData: InsertPermission): Promise<Permission> {
    const [permission] = await db
      .insert(permissions)
      .values(permissionData)
      .returning();
    return permission;
  }
}