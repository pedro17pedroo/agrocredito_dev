require('dotenv').config();

async function testAdminStats() {
  try {
    console.log('🔍 [TEST] === TESTANDO ENDPOINT /api/admin/stats ===');
    
    // Primeiro fazer login como admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginIdentifier: 'admin@agricredit.ao',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ [TEST] Erro no login:', loginResponse.statusText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ [TEST] Login realizado com sucesso');
    console.log('🔍 [TEST] Token obtido:', token ? 'SIM' : 'NÃO');
    
    // Agora testar o endpoint de stats
    const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      
      console.log('\n📊 [TEST] === DADOS DO ENDPOINT /api/admin/stats ===');
      console.log('📊 [TEST] Total:', statsData.total);
      console.log('📊 [TEST] Pendentes:', statsData.pending);
      console.log('📊 [TEST] Aprovadas:', statsData.approved);
      console.log('📊 [TEST] Rejeitadas:', statsData.rejected);
      console.log('📊 [TEST] Dados completos:', JSON.stringify(statsData, null, 2));
      
    } else {
      console.log('❌ [TEST] Erro na resposta do stats:', statsResponse.statusText);
      const errorText = await statsResponse.text();
      console.log('❌ [TEST] Detalhes do erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erro ao testar endpoint:', error.message);
  }
}

testAdminStats();