import React, { useState, useEffect } from 'react';
import { Upload, File, Download, Trash2, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

interface Document {
  id: string;
  documentType: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
  createdAt: string;
  isRequired?: boolean;
}

interface DocumentManagerProps {
  creditApplicationId?: string;
  onDocumentsChange?: (documents: Document[]) => void;
  readOnly?: boolean;
  showOnlySelected?: boolean;
  selectedDocuments?: string[];
  onDocumentsSelected?: (documentIds: string[]) => void;
}

const DOCUMENT_TYPES = {
  bilhete_identidade: 'Bilhete de Identidade (BI)',
  declaracao_soba: 'Declaração do Soba',
  declaracao_administracao_municipal: 'Declaração da Administração Municipal',
  comprovativo_actividade_agricola: 'Comprovativo da Actividade Agrícola',
  atestado_residencia: 'Atestado de Residência',
  outros: 'Outros'
};

const DocumentManager: React.FC<DocumentManagerProps> = ({
  creditApplicationId,
  onDocumentsChange,
  readOnly = false,
  showOnlySelected = false,
  selectedDocuments = [],
  onDocumentsSelected
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [creditApplicationId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = creditApplicationId 
        ? `/api/documents/credit-application/${creditApplicationId}`
        : '/api/documents/my-documents';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        onDocumentsChange?.(data.documents);
      } else {
        setError('Erro ao carregar documentos');
      }
    } catch (error) {
      setError('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!documentType) {
      setError('Selecione o tipo de documento');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const token = localStorage.getItem('auth_token');
      console.log('Token:', token ? 'Token encontrado' : 'Token não encontrado');
      console.log('Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
      console.log('Tipo de documento:', documentType);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload bem-sucedido:', data);
        setSuccess(data.message);
        loadDocuments();
        setSelectedDocumentType('');
      } else {
        const errorData = await response.json();
        console.error('Erro no upload:', errorData);
        setError(errorData.error || 'Erro ao fazer upload do documento');
      }
    } catch (error) {
      console.error('Erro de rede ou processamento:', error);
      setError('Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && selectedDocumentType) {
      handleFileUpload(files[0], selectedDocumentType);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedDocumentType) {
      handleFileUpload(files[0], selectedDocumentType);
    }
  };

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Erro ao fazer download do documento');
      }
    } catch (error) {
      setError('Erro ao fazer download do documento');
    }
  };

  const viewDocument = async (documentId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      // Abre diretamente o endpoint de visualização numa nova aba
      const viewUrl = `/api/documents/view/${documentId}?token=${encodeURIComponent(token || '')}`;
      window.open(viewUrl, '_blank');
    } catch (error) {
      setError('Erro ao visualizar o documento');
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Documento removido com sucesso');
        loadDocuments();
      } else {
        setError('Erro ao remover documento');
      }
    } catch (error) {
      setError('Erro ao remover documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = showOnlySelected 
    ? documents.filter(doc => selectedDocuments.includes(doc.id))
    : documents;

  const handleDocumentSelect = (documentId: string, selected: boolean) => {
    let newSelectedDocuments: string[];
    if (selected) {
      newSelectedDocuments = [...selectedDocuments, documentId];
    } else {
      newSelectedDocuments = selectedDocuments.filter(id => id !== documentId);
    }
    onDocumentsSelected?.(newSelectedDocuments);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!readOnly && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enviar Documento
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Documento
              </label>
              <select
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selecione o tipo de documento</option>
                {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              } ${!selectedDocumentType ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => {
                if (selectedDocumentType) {
                  document.getElementById('file-input')?.click();
                }
              }}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {selectedDocumentType
                  ? 'Clique aqui ou arraste um arquivo para fazer upload'
                  : 'Selecione primeiro o tipo de documento'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!selectedDocumentType}
              />
            </div>
          </div>

          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 dark:border-blue-200 mr-2"></div>
                Enviando documento...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {creditApplicationId ? 'Documentos da Aplicação' : 'Meus Documentos'}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando documentos...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <File className="mx-auto h-12 w-12 mb-4" />
            <p>Nenhum documento encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {onDocumentsSelected && (
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={(e) => handleDocumentSelect(document.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                  <File className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {DOCUMENT_TYPES[document.documentType as keyof typeof DOCUMENT_TYPES] || document.documentType}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {document.originalFileName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatFileSize(document.fileSize)} • Versão {document.version} • {new Date(document.createdAt).toLocaleDateString('pt-AO')}
                      {document.isRequired !== undefined && (
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          document.isRequired 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {document.isRequired ? 'Obrigatório' : 'Opcional'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => viewDocument(document.id, document.originalFileName)}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => downloadDocument(document.id, document.originalFileName)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  {!readOnly && document.id && (
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;