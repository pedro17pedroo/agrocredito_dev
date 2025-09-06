const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

async function debugPendingApplications() {
  console.log('🔍 [DEBUG] === ANÁLISE DE APLICAÇÕES PENDENTES ===');
  
  let connection;
  
  try {
    // Conectar à base de dados MySQL
    console.log('🔗 [DEBUG] Conectando à base de dados MySQL...');
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('✅ [DEBUG] Conectado à base de dados MySQL');
    
    // Consultar todas as aplicações
    const [rows] = await connection.execute(`
      SELECT 
        id, 
        user_id, 
        project_name, 
        status, 
        amount, 
        created_at,
        updated_at
      FROM credit_applications 
      ORDER BY created_at DESC
    `);
    
    console.log('📊 [DEBUG] Total de aplicações na BD:', rows.length);
    
    // Filtrar por status
    const pendingApps = rows.filter(app => app.status === 'pending');
    const underReviewApps = rows.filter(app => app.status === 'under_review');
    const approvedApps = rows.filter(app => app.status === 'approved');
    const rejectedApps = rows.filter(app => app.status === 'rejected');
    
    console.log('📊 [DEBUG] Contadores por status:');
    console.log('  - Pendentes:', pendingApps.length);
    console.log('  - Em análise:', underReviewApps.length);
    console.log('  - Aprovadas:', approvedApps.length);
    console.log('  - Rejeitadas:', rejectedApps.length);
    
    // Mostrar detalhes das aplicações pendentes
    console.log('\n🔍 [DEBUG] Aplicações pendentes detalhadas:');
    pendingApps.forEach((app, index) => {
      console.log(`  ${index + 1}. ID: ${app.id}`);
      console.log(`     Status: ${app.status}`);
      console.log(`     Projeto: ${app.project_name}`);
      console.log(`     Usuário: ${app.user_id}`);
      console.log(`     Criado em: ${app.created_at}`);
      console.log(`     Montante: ${app.amount}`);
      console.log('     ---');
    });
    
    // Verificar aplicações por usuário
    const userGroups = {};
    rows.forEach(app => {
      if (!userGroups[app.user_id]) {
        userGroups[app.user_id] = [];
      }
      userGroups[app.user_id].push(app);
    });
    
    console.log('\n👥 [DEBUG] Aplicações por usuário:');
    Object.entries(userGroups).forEach(([userId, apps]) => {
      const pending = apps.filter(app => app.status === 'pending').length;
      console.log(`  Usuário ${userId}: ${apps.length} total, ${pending} pendentes`);
    });
    
    // Verificar datas das aplicações pendentes
    console.log('\n📅 [DEBUG] Análise de datas das aplicações pendentes:');
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    pendingApps.forEach(app => {
      const createdAt = new Date(app.created_at);
      const isRecent = createdAt > oneMonthAgo;
      console.log(`  ID ${app.id}: ${createdAt.toISOString()} (${isRecent ? 'último mês' : 'mais antigo'})`);
    });
    
    // Verificar se há filtros específicos para relatórios de clientes
    console.log('\n🔍 [DEBUG] Verificando aplicações do último mês (filtro de relatórios):');
    const recentPendingApps = pendingApps.filter(app => {
      const createdAt = new Date(app.created_at);
      return createdAt > oneMonthAgo;
    });
    
    console.log(`  - Pendentes no último mês: ${recentPendingApps.length}`);
    console.log(`  - Pendentes totais: ${pendingApps.length}`);
    
    if (recentPendingApps.length !== pendingApps.length) {
      console.log('\n⚠️ [DEBUG] DISCREPÂNCIA ENCONTRADA!');
      console.log('  Os relatórios podem estar filtrando por data!');
      console.log('  Cards mostram aplicações do último mês apenas.');
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao analisar aplicações:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ [DEBUG] Conexão fechada');
    }
  }
}

// Executar o debug
debugPendingApplications().then(() => {
  console.log('\n✅ [DEBUG] Análise concluída');
  process.exit(0);
}).catch(error => {
  console.error('❌ [DEBUG] Erro fatal:', error);
  process.exit(1);
});