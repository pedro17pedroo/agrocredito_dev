import { CreditApplicationModel } from "./server/models/CreditApplication.js";

async function testAdminMethod() {
  try {
    console.log('Testando método findAllForAdmin...');
    
    const result = await CreditApplicationModel.findAllForAdmin();
    
    console.log('Resultado do findAllForAdmin:');
    console.log('- Novas:', result.new.length);
    console.log('- Em análise:', result.underReview.length);
    console.log('- Históricas:', result.historical.length);
    console.log('- Total:', result.new.length + result.underReview.length + result.historical.length);
    
    console.log('\nDetalhes das aplicações:');
    console.log('\nNovas:');
    result.new.forEach((app, i) => {
      console.log(`  ${i+1}. ${app.projectName} - ${app.status} - User: ${app.user.fullName}`);
    });
    
    console.log('\nEm análise:');
    result.underReview.forEach((app, i) => {
      console.log(`  ${i+1}. ${app.projectName} - ${app.status} - User: ${app.user.fullName}`);
    });
    
    console.log('\nHistóricas:');
    result.historical.forEach((app, i) => {
      console.log(`  ${i+1}. ${app.projectName} - ${app.status} - User: ${app.user.fullName}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao testar método findAllForAdmin:', error);
    process.exit(1);
  }
}

testAdminMethod();