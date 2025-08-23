import { db } from './server/db.js';
import { creditPrograms, users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkMariaPrograms() {
  try {
    // Buscar a Maria
    const maria = await db
      .select()
      .from(users)
      .where(eq(users.fullName, 'Maria Fernanda Silva'))
      .limit(1);
    
    if (maria.length === 0) {
      console.log('❌ Maria não encontrada');
      return;
    }
    
    console.log('✅ Maria encontrada:', maria[0].fullName);
    console.log('ID da Maria:', maria[0].id);
    
    // Buscar todos os programas da Maria
    const programs = await db
      .select()
      .from(creditPrograms)
      .where(eq(creditPrograms.financialInstitutionId, maria[0].id));
    
    console.log('\n📊 Total de programas da Maria:', programs.length);
    
    if (programs.length > 0) {
      console.log('\n📋 Lista de programas:');
      programs.forEach((program, index) => {
        console.log(`${index + 1}. ${program.name}`);
        console.log(`   - Ativo: ${program.isActive ? '✅ Sim' : '❌ Não'}`);
        console.log(`   - Tipos de projeto: ${program.projectTypes}`);
        console.log(`   - Montante: ${program.minAmount} - ${program.maxAmount}`);
        console.log('');
      });
      
      const activePrograms = programs.filter(p => p.isActive);
      console.log(`🟢 Programas ativos: ${activePrograms.length}`);
      console.log(`🔴 Programas inativos: ${programs.length - activePrograms.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkMariaPrograms();