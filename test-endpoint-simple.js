// Script para testar o endpoint admin com autenticação

async function loginAndTestEndpoint() {
  try {
    console.log('1. Fazendo login como admin...');
    
    // Primeiro, fazer login para obter o token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loginIdentifier: 'admin@agricredit.ao',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Erro no login:', loginResponse.status, loginResponse.statusText);
      const errorText = await loginResponse.text();
      console.log('Detalhes do erro:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login bem-sucedido!');
    console.log('Tipo de usuário:', loginData.user?.userType);
    
    const token = loginData.token;
    
    console.log('\n2. Testando endpoint /api/admin/credit-applications...');
    
    // Agora testar o endpoint com o token válido
    const response = await fetch('http://localhost:5000/api/admin/credit-applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n=== DADOS RETORNADOS ===');
      console.log('Tipo dos dados:', typeof data);
      console.log('É array?', Array.isArray(data));
      
      if (data.new && data.underReview && data.historical) {
        console.log('\n=== ESTRUTURA ADMIN ===');
        console.log('New:', data.new.length);
        console.log('Under Review:', data.underReview.length);
        console.log('Historical:', data.historical.length);
        console.log('Total combinado:', data.new.length + data.underReview.length + data.historical.length);
        
        console.log('\n=== DETALHES DAS APLICAÇÕES ===');
        console.log('New applications:', data.new.map(app => ({ id: app.id, name: app.projectName, status: app.status })));
        console.log('Under Review applications:', data.underReview.map(app => ({ id: app.id, name: app.projectName, status: app.status })));
        console.log('Historical applications:', data.historical.map(app => ({ id: app.id, name: app.projectName, status: app.status })));
      } else if (Array.isArray(data)) {
        console.log('\n=== ARRAY DIRETO ===');
        console.log('Total:', data.length);
        console.log('Aplicações:', data.map(app => ({ id: app.id, name: app.projectName, status: app.status })));
      } else {
        console.log('\n=== ESTRUTURA DESCONHECIDA ===');
        console.log('Dados completos:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('Erro na resposta:', response.statusText);
      const errorText = await response.text();
      console.log('Detalhes do erro:', errorText);
    }
  } catch (error) {
    console.error('Erro ao testar endpoint:', error.message);
  }
}

loginAndTestEndpoint();