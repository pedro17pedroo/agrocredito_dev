import bcrypt from "bcrypt";
import { db } from "../server/db";
import { eq, and } from "drizzle-orm";
import { 
  profiles, 
  permissions, 
  profilePermissions, 
  users,
  type InsertProfile,
  type InsertPermission,
  type InsertUser
} from "@shared/schema";

// Default permissions for the system
const defaultPermissions: InsertPermission[] = [
  // User management
  { name: "users.create", description: "Criar utilizadores", module: "users", action: "create" },
  { name: "users.read", description: "Ver utilizadores", module: "users", action: "read" },
  { name: "users.update", description: "Atualizar utilizadores", module: "users", action: "update" },
  { name: "users.delete", description: "Eliminar utilizadores", module: "users", action: "delete" },
  
  // Credit applications
  { name: "applications.create", description: "Criar solicitações de crédito", module: "applications", action: "create" },
  { name: "applications.read", description: "Ver solicitações de crédito", module: "applications", action: "read" },
  { name: "applications.update", description: "Atualizar solicitações de crédito", module: "applications", action: "update" },
  { name: "applications.approve", description: "Aprovar solicitações de crédito", module: "applications", action: "approve" },
  { name: "applications.reject", description: "Rejeitar solicitações de crédito", module: "applications", action: "reject" },
  
  // Accounts management
  { name: "accounts.create", description: "Criar contas", module: "accounts", action: "create" },
  { name: "accounts.read", description: "Ver contas", module: "accounts", action: "read" },
  { name: "accounts.update", description: "Atualizar contas", module: "accounts", action: "update" },
  { name: "accounts.suspend", description: "Suspender contas", module: "accounts", action: "suspend" },
  
  // Payments
  { name: "payments.create", description: "Registrar pagamentos", module: "payments", action: "create" },
  { name: "payments.read", description: "Ver pagamentos", module: "payments", action: "read" },
  { name: "payments.update", description: "Atualizar pagamentos", module: "payments", action: "update" },
  
  // Reports
  { name: "reports.read", description: "Ver relatórios", module: "reports", action: "read" },
  { name: "reports.export", description: "Exportar relatórios", module: "reports", action: "export" },
  
  // Admin functions
  { name: "admin.profiles", description: "Gerir perfis", module: "admin", action: "profiles" },
  { name: "admin.permissions", description: "Gerir permissões", module: "admin", action: "permissions" },
  { name: "admin.system", description: "Configurações do sistema", module: "admin", action: "system" },
  
  // Notifications
  { name: "notifications.read", description: "Ver notificações", module: "notifications", action: "read" },
  { name: "notifications.create", description: "Criar notificações", module: "notifications", action: "create" },
];

// Default profiles with their permissions
const defaultProfiles: { profile: InsertProfile; permissions: string[] }[] = [
  {
    profile: {
      name: "Administrador",
      description: "Acesso total ao sistema",
      isActive: true,
      isSystem: true,
    },
    permissions: defaultPermissions.map(p => p.name), // All permissions
  },
  {
    profile: {
      name: "Instituição Financeira",
      description: "Perfil para instituições financeiras",
      isActive: true,
      isSystem: true,
    },
    permissions: [
      "users.read",
      "applications.read",
      "applications.approve",
      "applications.reject",
      "accounts.create",
      "accounts.read",
      "accounts.update",
      "accounts.suspend",
      "payments.read",
      "payments.update",
      "reports.read",
      "reports.export",
      "notifications.read",
      "notifications.create",
      "admin.profiles",
      "admin.permissions",
    ],
  },
  {
    profile: {
      name: "Agricultor",
      description: "Perfil para agricultores individuais",
      isActive: true,
      isSystem: true,
    },
    permissions: [
      "applications.create",
      "applications.read",
      "accounts.read",
      "payments.read",
      "reports.read",
      "notifications.read",
    ],
  },
  {
    profile: {
      name: "Empresa Agrícola",
      description: "Perfil para empresas agrícolas",
      isActive: true,
      isSystem: true,
    },
    permissions: [
      "applications.create",
      "applications.read",
      "applications.update",
      "accounts.read",
      "payments.create",
      "payments.read",
      "reports.read",
      "reports.export",
      "notifications.read",
    ],
  },
  {
    profile: {
      name: "Cooperativa",
      description: "Perfil para cooperativas agrícolas",
      isActive: true,
      isSystem: true,
    },
    permissions: [
      "applications.create",
      "applications.read",
      "applications.update",
      "accounts.read",
      "payments.create",
      "payments.read",
      "reports.read",
      "reports.export",
      "notifications.read",
    ],
  },
];

export async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed da base de dados...");

    // 1. Create permissions
    console.log("📋 Criando permissões...");
    const permissionIds: { [key: string]: string } = {};
    
    for (const permission of defaultPermissions) {
      const [existingPerm] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.name, permission.name))
        .limit(1);
        
      if (!existingPerm) {
        const result = await db
          .insert(permissions)
          .values(permission);
        
        // Get the inserted permission by name
        const [newPerm] = await db
          .select()
          .from(permissions)
          .where(eq(permissions.name, permission.name))
          .limit(1);
        
        if (newPerm) {
          permissionIds[permission.name] = newPerm.id;
        }
        console.log(`  ✅ Criada permissão: ${permission.name}`);
      } else {
        permissionIds[permission.name] = existingPerm.id;
        console.log(`  ⏭️ Permissão já existe: ${permission.name}`);
      }
    }

    // 2. Create profiles and assign permissions
    console.log("👥 Criando perfis...");
    const profileIds: { [key: string]: string } = {};
    
    for (const { profile, permissions: profilePerms } of defaultProfiles) {
      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.name, profile.name))
        .limit(1);
        
      let profileId: string;
      
      if (!existingProfile) {
        const result = await db
          .insert(profiles)
          .values(profile);
        
        // Get the inserted profile by name
        const [newProfile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.name, profile.name))
          .limit(1);
        
        if (newProfile) {
          profileId = newProfile.id;
          profileIds[profile.name] = profileId;
          console.log(`  ✅ Criado perfil: ${profile.name}`);
        } else {
          console.error(`  ❌ Erro ao criar perfil: ${profile.name}`);
          continue;
        }
      } else {
        profileId = existingProfile.id;
        profileIds[profile.name] = profileId;
        console.log(`  ⏭️ Perfil já existe: ${profile.name}`);
      }

      // Assign permissions to profile
      for (const permName of profilePerms) {
        const permissionId = permissionIds[permName];
        if (permissionId) {
          const [existing] = await db
            .select()
            .from(profilePermissions)
            .where(and(
              eq(profilePermissions.profileId, profileId),
              eq(profilePermissions.permissionId, permissionId)
            ))
            .limit(1);
            
          if (!existing) {
            await db
              .insert(profilePermissions)
              .values({ profileId, permissionId });
          }
        }
      }
    }

    // 3. Create admin user
    console.log("👤 Criando utilizador admin...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminProfileId = profileIds["Administrador"];
    
    const adminUser: InsertUser = {
      fullName: "Administrador do Sistema",
      bi: "000000000LA000",
      phone: "+244900000000",
      email: "admin@agricredit.ao",
      password: adminPassword,
      userType: "admin",
      profileId: adminProfileId,
      isActive: true,
    };

    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.phone, adminUser.phone))
      .limit(1);

    if (!existingAdmin) {
      await db.insert(users).values(adminUser);
      console.log("  ✅ Utilizador admin criado com sucesso!");
      console.log("  📧 Email: admin@agricredit.ao");
      console.log("  📱 Telefone: +244900000000");
      console.log("  🔐 Palavra-passe: admin123");
    } else {
      console.log("  ⏭️ Utilizador admin já existe");
    }

    // 4. Create test farmer user
    console.log("🌱 Criando utilizador agricultor de teste...");
    const farmerPassword = await bcrypt.hash("farmer123", 10);
    const farmerProfileId = profileIds["Agricultor"];
    
    const farmerUser: InsertUser = {
      fullName: "João Manuel dos Santos",
      bi: "001234567LA041",
      nif: "5417037682",
      phone: "+244923456789",
      email: "joao.santos@gmail.com",
      password: farmerPassword,
      userType: "farmer",
      profileId: farmerProfileId,
      isActive: true,
    };

    const [existingFarmer] = await db
      .select()
      .from(users)
      .where(eq(users.phone, farmerUser.phone))
      .limit(1);

    if (!existingFarmer) {
      await db.insert(users).values(farmerUser);
      console.log("  ✅ Utilizador agricultor criado com sucesso!");
      console.log("  📧 Email: joao.santos@gmail.com");
      console.log("  📱 Telefone: +244923456789");
      console.log("  🔐 Palavra-passe: farmer123");
    } else {
      console.log("  ⏭️ Utilizador agricultor já existe");
    }

    // 5. Create test financial institution user
    console.log("🏦 Criando utilizador instituição financeira de teste...");
    const bankPassword = await bcrypt.hash("bank123", 10);
    const bankProfileId = profileIds["Instituição Financeira"];
    
    const bankUser: InsertUser = {
      fullName: "Maria Fernanda Silva",
      bi: "002345678LA042",
      nif: "5417037683",
      phone: "+244934567890",
      email: "maria.silva@bai.ao",
      password: bankPassword,
      userType: "financial_institution",
      profileId: bankProfileId,
      isActive: true,
    };

    const [existingBank] = await db
      .select()
      .from(users)
      .where(eq(users.phone, bankUser.phone))
      .limit(1);

    if (!existingBank) {
      await db.insert(users).values(bankUser);
      console.log("  ✅ Utilizador instituição financeira criado com sucesso!");
      console.log("  📧 Email: maria.silva@bai.ao");
      console.log("  📱 Telefone: +244934567890");
      console.log("  🔐 Palavra-passe: bank123");
    } else {
      console.log("  ⏭️ Utilizador instituição financeira já existe");
    }

    // 6. Create test company user
    console.log("🏢 Criando utilizador empresa agrícola de teste...");
    const companyPassword = await bcrypt.hash("company123", 10);
    const companyProfileId = profileIds["Empresa Agrícola"];
    
    const companyUser: InsertUser = {
      fullName: "Carlos Eduardo Mendes",
      bi: "003456789LA043",
      nif: "5417037684",
      phone: "+244945678901",
      email: "carlos.mendes@agroangola.ao",
      password: companyPassword,
      userType: "company",
      profileId: companyProfileId,
      isActive: true,
    };

    const [existingCompany] = await db
      .select()
      .from(users)
      .where(eq(users.phone, companyUser.phone))
      .limit(1);

    if (!existingCompany) {
      await db.insert(users).values(companyUser);
      console.log("  ✅ Utilizador empresa agrícola criado com sucesso!");
      console.log("  📧 Email: carlos.mendes@agroangola.ao");
      console.log("  📱 Telefone: +244945678901");
      console.log("  🔐 Palavra-passe: company123");
    } else {
      console.log("  ⏭️ Utilizador empresa agrícola já existe");
    }

    console.log("🎉 Seed da base de dados concluído com sucesso!");
    console.log("\n📋 Resumo dos utilizadores criados:");
    console.log("👤 Admin: admin@agricredit.ao / admin123");
    console.log("🌱 Agricultor: joao.santos@gmail.com / farmer123");
    console.log("🏦 Instituição Financeira: maria.silva@bai.ao / bank123");
    console.log("🏢 Empresa Agrícola: carlos.mendes@agroangola.ao / company123");
    
  } catch (error) {
    console.error("❌ Erro no seed da base de dados:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seed executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro no seed:", error);
      process.exit(1);
    });
}