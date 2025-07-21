import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Folder,
  Search,
  Filter,
  Plus,
  X,
  Calendar,
  User,
  File,
  Image,
  Video,
  Archive,
  CheckCircle,
  AlertCircle,
  Clock,
  Share2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const DocumentManager = ({ assetId, isOpen, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (assetId && isOpen) {
      loadDocuments();
      loadFolders();
    }
  }, [assetId, isOpen]);

  const loadDocuments = () => {
    const saved = localStorage.getItem(`asset_documents_${assetId}`);
    if (saved) {
      setDocuments(JSON.parse(saved));
    } else {
      // Initialize with sample documents
      const sampleDocs = [
        {
          id: 1,
          name: 'Property Deed.pdf',
          type: 'application/pdf',
          size: 2457600,
          folderId: null,
          uploadedAt: '2024-01-15T10:30:00Z',
          uploadedBy: 'Admin User',
          category: 'legal',
          description: 'Original property deed and ownership documents',
          tags: ['ownership', 'legal', 'deed'],
          isShared: true,
          version: 1
        },
        {
          id: 2,
          name: 'Inspection Report 2024.pdf',
          type: 'application/pdf',
          size: 1843200,
          folderId: 1,
          uploadedAt: '2024-03-20T14:15:00Z',
          uploadedBy: 'Inspector John',
          category: 'inspection',
          description: 'Annual inspection report with findings and recommendations',
          tags: ['inspection', '2024', 'maintenance'],
          isShared: false,
          version: 2
        },
        {
          id: 3,
          name: 'Floor Plans.dwg',
          type: 'application/acad',
          size: 5242880,
          folderId: 2,
          uploadedAt: '2024-02-10T09:45:00Z',
          uploadedBy: 'Architect',
          category: 'plans',
          description: 'Detailed floor plans and architectural drawings',
          tags: ['plans', 'architecture', 'blueprints'],
          isShared: true,
          version: 1
        }
      ];
      setDocuments(sampleDocs);
      saveDocuments(sampleDocs);
    }
  };

  const loadFolders = () => {
    const saved = localStorage.getItem(`asset_folders_${assetId}`);
    if (saved) {
      setFolders(JSON.parse(saved));
    } else {
      // Initialize with default folders
      const defaultFolders = [
        {
          id: 1,
          name: 'Inspections',
          description: 'Inspection reports and related documents',
          createdAt: '2024-01-01T00:00:00Z',
          color: 'blue'
        },
        {
          id: 2,
          name: 'Plans & Drawings',
          description: 'Architectural plans, blueprints, and technical drawings',
          createdAt: '2024-01-01T00:00:00Z',
          color: 'green'
        },
        {
          id: 3,
          name: 'Legal Documents',
          description: 'Contracts, deeds, and legal documentation',
          createdAt: '2024-01-01T00:00:00Z',
          color: 'red'
        }
      ];
      setFolders(defaultFolders);
      saveFolders(defaultFolders);
    }
  };

  const saveDocuments = (docs) => {
    localStorage.setItem(`asset_documents_${assetId}`, JSON.stringify(docs));
  };

  const saveFolders = (folderList) => {
    localStorage.setItem(`asset_folders_${assetId}`, JSON.stringify(folderList));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);

    files.forEach((file, index) => {
      setTimeout(() => {
        const newDoc = {
          id: Date.now() + index,
          name: file.name,
          type: file.type,
          size: file.size,
          folderId: currentFolder?.id || null,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Current User',
          category: getCategoryFromType(file.type),
          description: '',
          tags: [],
          isShared: false,
          version: 1,
          url: URL.createObjectURL(file) // In real app, upload to server
        };

        const updatedDocs = [newDoc, ...documents];
        setDocuments(updatedDocs);
        saveDocuments(updatedDocs);

        if (index === files.length - 1) {
          setUploading(false);
          setShowUploadModal(false);
          toast.success(`${files.length} file(s) uploaded successfully`);
        }
      }, index * 100);
    });
  };

  const getCategoryFromType = (type) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type === 'application/pdf') return 'pdf';
    if (type.includes('word') || type.includes('document')) return 'document';
    if (type.includes('sheet') || type.includes('excel')) return 'spreadsheet';
    return 'other';
  };

  const getFileIcon = (type, size = 'w-5 h-5') => {
    if (type.startsWith('image/')) return <Image className={`${size} text-blue-600`} />;
    if (type.startsWith('video/')) return <Video className={`${size} text-purple-600`} />;
    if (type === 'application/pdf') return <FileText className={`${size} text-red-600`} />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className={`${size} text-orange-600`} />;
    return <File className={`${size} text-gray-600`} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      setSelectedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
      toast.success('Document deleted');
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: Date.now(),
      name: newFolderName,
      description: '',
      createdAt: new Date().toISOString(),
      color: 'gray'
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
    setNewFolderName('');
    setShowFolderModal(false);
    toast.success('Folder created');
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const downloadDocument = (doc) => {
    if (doc.url) {
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started');
    } else {
      toast.error('Document URL not available');
    }
  };

  const getFilteredDocuments = () => {
    let filtered = documents.filter(doc => 
      currentFolder ? doc.folderId === currentFolder.id : doc.folderId === null
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterType);
    }

    return filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  };

  const getDocumentStats = () => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const byCategory = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: documents.length,
      totalSize,
      byCategory,
      shared: documents.filter(doc => doc.isShared).length
    };
  };

  if (!isOpen) return null;

  const filteredDocs = getFilteredDocuments();
  const stats = getDocumentStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Manager</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {stats.total} documents • {formatFileSize(stats.totalSize)} total
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFolderModal(true)}
                className="btn-secondary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`px-3 py-1 rounded-lg text-sm ${
                !currentFolder ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Root
            </button>
            {currentFolder && (
              <>
                <span className="text-gray-400">/</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/20 rounded-lg text-sm">
                  {currentFolder.name}
                </span>
              </>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF Documents</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="spreadsheet">Spreadsheets</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Folders */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Folders</h3>
                <div className="space-y-2">
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentFolder(folder)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left ${
                        currentFolder?.id === folder.id 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="text-sm truncate">{folder.name}</span>
                      <span className="text-xs text-gray-500">
                        {documents.filter(doc => doc.folderId === folder.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Documents</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shared</span>
                    <span className="font-medium">{stats.shared}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Size</span>
                    <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document List */}
            <div className="lg:col-span-3">
              {filteredDocs.length > 0 ? (
                <div className="space-y-3">
                  {filteredDocs.map(doc => (
                    <div
                      key={doc.id}
                      className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedDocuments.has(doc.id) 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => toggleDocumentSelection(doc.id)}
                        className="rounded"
                      />
                      
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {doc.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{format(parseISO(doc.uploadedAt), 'MMM dd, yyyy')}</span>
                          <span>•</span>
                          <span>{doc.uploadedBy}</span>
                          {doc.isShared && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Share2 className="w-3 h-3 mr-1" />
                                Shared
                              </div>
                            </>
                          )}
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documents</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterType !== 'all' ? 'No documents match your search' : 'Upload documents to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Documents</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drop files here or</p>
                <label className="btn-primary cursor-pointer">
                  Choose Files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Folder Modal */}
        {showFolderModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  className="btn-primary"
                  disabled={!newFolderName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;