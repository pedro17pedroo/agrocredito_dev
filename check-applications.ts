import { db } from "./server/db.js";
import { creditApplications } from "./shared/schema.js";

async function checkApplications() {
  try {
    const apps = await db.select().from(creditApplications);
    console.log('Total de aplicações na BD:', apps.length);
    
    apps.forEach((app, i) => {
      console.log(`${i+1}. ${app.projectName} - Status: ${app.status} - Created: ${app.createdAt} - User: ${app.userId}`);
    });
    
    // Contar por status
    const statusCount = apps.reduce((acc, app) => {
      const status = app.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nContagem por status:', statusCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkApplications();