import readline from 'readline';

console.log('🧪 Teste de Input no Windows');
console.log('=' .repeat(40));

// Função de teste simples
function testInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n❓ Por favor, digite qualquer coisa e pressione ENTER:');
    
    rl.question('> ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Iniciando teste de input...');
    
    const userInput = await testInput();
    
    console.log(`\n✅ Input recebido: "${userInput}"`);
    console.log(`📏 Comprimento: ${userInput.length} caracteres`);
    console.log(`🔤 Tipo: ${typeof userInput}`);
    
    if (userInput.trim().length === 0) {
      console.log('⚠️ Input vazio detectado');
    } else {
      console.log('✅ Input válido recebido');
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    console.error('📍 Stack:', error.stack);
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✅ Teste finalizado!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro no teste:', error);
      process.exit(1);
    });
}

export { main as testInput };