// Script para testar a filtragem de dados na página de relatórios

async function testReportsFiltering() {
  try {
    console.log('🔍 === TESTE DE FILTRAGEM DE RELATÓRIOS ===');
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    // Primeiro, fazer login como admin
    console.log('\n1. Fazendo login como admin...');
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
      console.log('❌ Erro no login:', loginResponse.status, loginResponse.statusText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login bem-sucedido!');
    
    // Testar o endpoint de aplicações
    console.log('\n2. Testando endpoint /api/admin/credit-applications...');
    const response = await fetch('http://localhost:5000/api/admin/credit-applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.log('❌ Erro na resposta:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('\n=== DADOS RETORNADOS PELA API ===');
    
    // Combinar todas as aplicações
    const allApplications = [...data.new, ...data.underReview, ...data.historical];
    console.log('📊 Total de aplicações:', allApplications.length);
    
    // Simular a filtragem por data (últimos 3 meses)
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    threeMonthsAgo.setDate(1); // Início do mês
    
    console.log('\n=== SIMULAÇÃO DE FILTRAGEM POR DATA ===');
    console.log('📅 Data atual:', now.toISOString());
    console.log('📅 Três meses atrás:', threeMonthsAgo.toISOString());
    
    const filteredByDate = allApplications.filter(app => {
      if (!app.createdAt) return false;
      const appDate = new Date(app.createdAt);
      return appDate >= threeMonthsAgo && appDate <= now;
    });
    
    console.log('📊 Aplicações filtradas (últimos 3 meses):', filteredByDate.length);
    
    // Mostrar detalhes das aplicações filtradas
    console.log('\n=== APLICAÇÕES DENTRO DO PERÍODO (últimos 3 meses) ===');
    filteredByDate.forEach((app, index) => {
      console.log(`${index + 1}. ${app.projectName}`);
      console.log(`   - Status: ${app.status}`);
      console.log(`   - Data: ${app.createdAt}`);
      console.log(`   - ID: ${app.id}`);
    });
    
    // Mostrar aplicações fora do período
    const outsidePeriod = allApplications.filter(app => {
      if (!app.createdAt) return true;
      const appDate = new Date(app.createdAt);
      return appDate < threeMonthsAgo || appDate > now;
    });
    
    if (outsidePeriod.length > 0) {
      console.log('\n=== APLICAÇÕES FORA DO PERÍODO ===');
      outsidePeriod.forEach((app, index) => {
        console.log(`${index + 1}. ${app.projectName}`);
        console.log(`   - Status: ${app.status}`);
        console.log(`   - Data: ${app.createdAt}`);
        console.log(`   - ID: ${app.id}`);
      });
    }
    
    // Contar por status nas aplicações filtradas
    const statusCount = filteredByDate.reduce((acc, app) => {
      const status = app.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n=== CONTAGEM POR STATUS (aplicações filtradas) ===');
    console.log('📊 Status count:', statusCount);
    
    // Simular filtragem para "todos os dados"
    const allTimeFilter = allApplications.filter(app => {
      if (!app.createdAt) return false;
      const appDate = new Date(app.createdAt);
      const startDate = new Date(2020, 0, 1); // 1 de janeiro de 2020
      return appDate >= startDate && appDate <= now;
    });
    
    console.log('\n=== SIMULAÇÃO "TODOS OS DADOS" ===');
    console.log('📊 Total com filtro "todos os dados":', allTimeFilter.length);
    
    const allTimeStatusCount = allTimeFilter.reduce((acc, app) => {
      const status = app.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Status count (todos os dados):', allTimeStatusCount);
    
  } catch (error) {
    console.error('❌ Erro ao testar filtragem:', error.message);
  }
}

testReportsFiltering();