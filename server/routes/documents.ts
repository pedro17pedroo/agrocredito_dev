import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { DocumentModel } from '../models/Document';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  userType: string;
}

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas PDFs e imagens
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas PDF e imagens são aceitos.'));
    }
  }
});

/**
 * POST /api/documents/upload
 * Faz upload de um novo documento
 */
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ error: 'Tipo de documento é obrigatório' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verifica se já existe um documento ativo deste tipo para o usuário
    const existingDocuments = await DocumentModel.findByUserAndType(userId, documentType);
    
    const documentData = {
      userId,
      documentType: documentType as any,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    } as any;

    let document;
    
    if (existingDocuments.length > 0) {
      // Se existe um documento do mesmo tipo, substitui
      const oldDocument = existingDocuments[0];
      document = await DocumentModel.replaceDocument(oldDocument.id, documentData);
    } else {
      // Cria um novo documento
      document = await DocumentModel.create(documentData);
    }

    res.status(201).json({
      message: 'Documento enviado com sucesso',
      document: {
        id: document.id,
        documentType: document.documentType,
        originalFileName: document.originalFileName,
        fileSize: document.fileSize,
        version: document.version,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/documents/my-documents
 * Busca todos os documentos do usuário autenticado
 */
router.get('/my-documents', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const documents = await DocumentModel.findByUser(userId);
    
    // Remove informações sensíveis como caminho do arquivo
    const safeDocuments = documents.map(doc => ({
      id: doc.id,
      documentType: doc.documentType,
      originalFileName: doc.originalFileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      version: doc.version,
      createdAt: doc.createdAt
    }));

    res.json({ documents: safeDocuments });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/documents/by-type/:type
 * Busca documentos do usuário por tipo
 */
router.get('/by-type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const documents = await DocumentModel.findByUserAndType(userId, type);
    
    const safeDocuments = documents.map(doc => ({
      id: doc.id,
      documentType: doc.documentType,
      originalFileName: doc.originalFileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      version: doc.version,
      createdAt: doc.createdAt
    }));

    res.json({ documents: safeDocuments });
  } catch (error) {
    console.error('Erro ao buscar documentos por tipo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/documents/download/:id
 * Faz download de um documento
 */
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userType = req.user?.userType;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verifica se o usuário pode acessar o documento
    const canAccess = await DocumentModel.canUserAccessDocument(userId, id, userType || '');
    if (!canAccess) {
      return res.status(403).json({ error: 'Acesso negado ao documento' });
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Verifica se o arquivo existe
    try {
      await fs.access(document.filePath);
    } catch {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    // Define headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
    res.setHeader('Content-Type', document.mimeType);
    
    // Envia o arquivo
    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    console.error('Erro ao fazer download do documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/documents/view/:id
 * Visualiza um documento no navegador
 */
router.get('/view/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    // Verifica o token de autenticação
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação necessário' });
    }

    // Verifica o token JWT
    let decoded;
    try {
      decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userId = decoded.userId;
    const userType = decoded.userType;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!userType) {
      return res.status(401).json({ error: 'Tipo de usuário não encontrado no token' });
    }

    // Verifica se o usuário pode acessar o documento
    const canAccess = await DocumentModel.canUserAccessDocument(userId, id, userType);
    if (!canAccess) {
      return res.status(403).json({ error: 'Acesso negado ao documento' });
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Verifica se o arquivo existe
    try {
      await fs.access(document.filePath);
    } catch {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    // Define headers para visualização inline
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalFileName}"`);
    
    // Envia o arquivo
    res.sendFile(path.resolve(document.filePath));
  } catch (error) {
    console.error('Erro ao visualizar documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/documents/:id
 * Remove um documento
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Verifica se o documento pertence ao usuário
    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const deleted = await DocumentModel.delete(id);
    if (deleted) {
      res.json({ message: 'Documento removido com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao remover documento' });
    }
  } catch (error) {
    console.error('Erro ao remover documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/documents/credit-application/:applicationId
 * Busca documentos associados a uma aplicação de crédito
 * (Apenas para instituições financeiras e o próprio solicitante)
 */
router.get('/credit-application/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.id;
    const userType = req.user?.userType;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Aqui você pode adicionar verificação se o usuário tem permissão para ver
    // os documentos desta aplicação específica
    
    const documents = await DocumentModel.findByCreditApplication(applicationId);
    
    const safeDocuments = documents.map(doc => ({
      id: doc.id,
      documentType: doc.documentType,
      originalFileName: doc.originalFileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      version: doc.version,
      isRequired: doc.isRequired,
      createdAt: doc.createdAt
    }));

    res.json({ documents: safeDocuments });
  } catch (error) {
    console.error('Erro ao buscar documentos da aplicação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;