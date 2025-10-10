'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { DocumentProcessor } from './DocumentProcessor';
import { ParsedDocumentData } from '@/utils/documentParser';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string;
  category: string;
  type: string;
  ocrText?: string;
  extractedData?: string;
  processingStatus: string;
  reviewStatus: string;
  documentDate?: string;
  mileage?: number;
  totalCost?: number;
  shopName?: string;
  createdAt: string;
  vehicle?: {
    id: string;
    year?: number;
    make?: string;
    model?: string;
    nickname?: string;
  };
  maintenanceRecord?: {
    id: string;
    title: string;
    type: string;
  };
}

interface DocumentListProps {
  userId: string;
  vehicleId?: string;
  onCreateServiceRecord?: (data: ParsedDocumentData, document: Document) => void;
}

export function DocumentList({ userId, vehicleId, onCreateServiceRecord }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams({
        userId,
        ...(vehicleId && vehicleId !== 'all' && { vehicleId })
      });

      const response = await fetch(`/api/documents/upload?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId, vehicleId]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const handleProcessingComplete = (documentId: string, result: any) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === documentId
          ? {
              ...doc,
              processingStatus: result.success ? 'COMPLETED' : 'FAILED',
              ocrText: result.ocrText,
              extractedData: result.extractedData ? JSON.stringify(result.extractedData) : undefined
            }
          : doc
      )
    );
  };

  const handleCreateServiceRecord = (data: ParsedDocumentData, document: Document) => {
    if (onCreateServiceRecord) {
      onCreateServiceRecord(data, document);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.processingStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'IN_PROGRESS':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Processed';
      case 'FAILED': return 'Failed';
      case 'IN_PROGRESS': return 'Processing';
      case 'PENDING': return 'Pending';
      default: return 'Unknown';
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'RECEIPT', label: 'Receipts' },
    { value: 'INVOICE', label: 'Invoices' },
    { value: 'INSPECTION', label: 'Inspections' },
    { value: 'WARRANTY', label: 'Warranty' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'REGISTRATION', label: 'Registration' },
    { value: 'TITLE', label: 'Title' },
    { value: 'ESTIMATE', label: 'Estimates' },
    { value: 'MANUAL', label: 'Manuals' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Documents ({filteredDocuments.length})
          </h2>

          <button
            onClick={fetchDocuments}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.map((document) => (
            <div key={document.id}>
              {selectedDocument?.id === document.id ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Back to list
                  </button>
                  <DocumentProcessor
                    document={document}
                    onProcessingComplete={handleProcessingComplete}
                    onCreateServiceRecord={(data) => handleCreateServiceRecord(data, document)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {document.thumbnailPath ? (
                          <img
                            src={document.thumbnailPath}
                            alt={document.originalName}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {document.originalName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {document.category.replace(/_/g, ' ').toLowerCase()} • {Math.round(document.fileSize / 1024)} KB
                          </p>
                          {document.vehicle && (
                            <p className="text-xs text-gray-400 truncate">
                              {document.vehicle.year} {document.vehicle.make} {document.vehicle.model} {document.vehicle.nickname}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.processingStatus)}
                        <span className="text-xs text-gray-600">
                          {getStatusText(document.processingStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Extracted Information Preview */}
                    {document.extractedData && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs font-medium text-blue-800 mb-1">Extracted Data:</p>
                        {document.documentDate && (
                          <p className="text-xs text-blue-700">Date: {new Date(document.documentDate).toLocaleDateString()}</p>
                        )}
                        {document.totalCost && (
                          <p className="text-xs text-blue-700">Amount: ${document.totalCost.toFixed(2)}</p>
                        )}
                        {document.mileage && (
                          <p className="text-xs text-blue-700">Mileage: {document.mileage.toLocaleString()} miles</p>
                        )}
                        {document.shopName && (
                          <p className="text-xs text-blue-700">Shop: {document.shopName}</p>
                        )}
                      </div>
                    )}

                    {/* Linked Service Record */}
                    {document.maintenanceRecord && (
                      <div className="mb-4 p-3 bg-green-50 rounded-md">
                        <p className="text-xs font-medium text-green-800 mb-1">Linked Service Record:</p>
                        <p className="text-xs text-green-700">{document.maintenanceRecord.title}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedDocument(document)}
                          className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {document.processingStatus === 'PENDING' ? 'Process' : 'View'}
                        </button>

                        <a
                          href={document.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </a>
                      </div>

                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="flex items-center px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      Uploaded {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}