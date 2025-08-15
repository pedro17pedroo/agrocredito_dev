const mysql = require('mysql2/promise');

async function checkDocument() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'agrocredito_dev',
  });

  const documentId = 'f445f237-3c06-44d1-9d8b-7a14d8c022d7';
  
  console.log('Verificando documento:', documentId);
  
  // Verificar se o documento existe
  const [documentRows] = await connection.execute(
    'SELECT * FROM documents WHERE id = ?',
    [documentId]
  );
  
  console.log('Documento encontrado:', documentRows.length > 0 ? 'SIM' : 'NÃO');
  if (documentRows.length > 0) {
    console.log('Dados do documento:', documentRows[0]);
  }
  
  // Verificar associações na tabela credit_app_docs
  const [associationRows] = await connection.execute(
    'SELECT * FROM credit_app_docs WHERE document_id = ?',
    [documentId]
  );
  
  console.log('Associações encontradas:', associationRows.length);
  if (associationRows.length > 0) {
    console.log('Dados das associações:', associationRows);
  }
  
  await connection.end();
}

checkDocument().catch(console.error);