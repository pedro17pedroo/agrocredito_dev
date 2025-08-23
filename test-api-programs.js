// Usar fetch nativo do Node.js

async function testApiPrograms() {
  try {
    const mariaId = '5aaf93c2-7380-11f0-9dfe-62f08be7e6ca';
    
    console.log('🔍 Testando endpoint da API...');
    console.log(`URL: http://localhost:5173/api/credit-programs/institution/${mariaId}`);
    
    const response = await fetch(`http://localhost:5173/api/credit-programs/institution/${mariaId}`);
    
    if (!response.ok) {
      console.log('❌ Erro na resposta:', response.status, response.statusText);
      return;
    }
    
    const programs = await response.json();
    
    console.log('✅ Resposta da API recebida');
    console.log('📊 Total de programas retornados:', programs.length);
    
    if (programs.length > 0) {
      console.log('\n📋 Programas retornados pela API:');
      programs.forEach((program, index) => {
        console.log(`${index + 1}. ${program.name}`);
        console.log(`   - ID: ${program.id}`);
        console.log(`   - Tipos de projeto: ${JSON.stringify(program.projectTypes)}`);
        console.log(`   - Montante: ${program.minAmount} - ${program.maxAmount}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum programa retornado pela API');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testApiPrograms();