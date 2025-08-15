#!/bin/bash

# Token obtido do login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YWE0YWIxMC03MzgwLTExZjAtOWRmZS02MmYwOGJlN2U2Y2EiLCJpYXQiOjE3NTQ5ODk1NDIsImV4cCI6MTc1NTU5NDM0Mn0.hHCsY0_O1QpDnZj9wDUO_G8tLiE55dWXcsoETgDe1Mk"

# Criar um arquivo PDF de teste
echo "%PDF-1.4" > test_document.pdf
echo "1 0 obj" >> test_document.pdf
echo "<<" >> test_document.pdf
echo "/Type /Catalog" >> test_document.pdf
echo "/Pages 2 0 R" >> test_document.pdf
echo ">>" >> test_document.pdf
echo "endobj" >> test_document.pdf
echo "xref" >> test_document.pdf
echo "0 2" >> test_document.pdf
echo "0000000000 65535 f" >> test_document.pdf
echo "0000000009 00000 n" >> test_document.pdf
echo "trailer" >> test_document.pdf
echo "<<" >> test_document.pdf
echo "/Size 2" >> test_document.pdf
echo "/Root 1 0 R" >> test_document.pdf
echo ">>" >> test_document.pdf
echo "startxref" >> test_document.pdf
echo "64" >> test_document.pdf
echo "%%EOF" >> test_document.pdf

# Fazer upload do documento
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@test_document.pdf" \
  -F "documentType=bilhete_identidade" \
  -v

# Limpar arquivo de teste
rm -f test_document.pdf