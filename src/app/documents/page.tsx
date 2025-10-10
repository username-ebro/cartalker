'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Image,
  X,
  Check,
  AlertCircle,
  Loader2,
  Car,
  Plus,
  Camera
} from 'lucide-react';
import { DocumentList } from '@/components/DocumentList';
import { ParsedDocumentData } from '@/utils/documentParser';

interface UploadFile {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface Vehicle {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  nickname?: string;
}

export default function DocumentsPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock user ID - in a real app this would come from authentication
  const userId = 'user_123';

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/heic', 'image/webp', 'application/pdf'
    ];

    const validFiles = files.filter(file => {
      if (!supportedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please use JPG, PNG, PDF, HEIC, or WebP files.`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    const newUploadFiles: UploadFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          try {
            preview = await createImagePreview(file);
          } catch (error) {
            console.warn('Failed to create preview for', file.name);
          }
        }

        return {
          file,
          id,
          preview,
          status: 'pending' as const
        };
      })
    );

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add files to form data
      uploadFiles.forEach(uploadFile => {
        formData.append('files', uploadFile.file);
      });

      // Add metadata
      formData.append('userId', userId);
      if (selectedVehicle) {
        formData.append('vehicleId', selectedVehicle);
      }

      // Update upload status
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        // Update success status
        setUploadFiles(prev => prev.map(f => ({ ...f, status: 'success' as const })));
        setUploadProgress(100);

        // Clear files after a delay
        setTimeout(() => {
          setUploadFiles([]);
          setUploadProgress(0);
          setRefreshKey(prev => prev + 1); // Trigger document list refresh
        }, 2000);

      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);

      // Update error status
      setUploadFiles(prev => prev.map(f => ({
        ...f,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateServiceRecord = (data: ParsedDocumentData, document: any) => {
    // Navigate to maintenance page with pre-filled data
    const params = new URLSearchParams({
      from: 'document',
      documentId: document.id,
      ...(data.dates[0] && { date: data.dates[0].date.toISOString() }),
      ...(data.mileage[0] && { mileage: data.mileage[0].mileage.toString() }),
      ...(data.amounts[0] && { totalCost: data.amounts[0].amount.toString() }),
      ...(data.serviceTypes[0] && { serviceType: data.serviceTypes[0].serviceType }),
      ...(data.businessInfo[0]?.name && { shopName: data.businessInfo[0].name }),
      ...(document.vehicle?.id && { vehicleId: document.vehicle.id })
    });

    window.location.href = `/maintenance?${params}`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="mt-2 text-gray-600">
          Upload and process your vehicle service documents with automatic OCR text extraction
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>

        {/* Vehicle Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Associate with Vehicle (Optional)
          </label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a vehicle...</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.nickname ? `(${vehicle.nickname})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {dragActive ? (
                <Upload className="w-12 h-12 text-blue-500" />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? 'Drop files here' : 'Upload service documents'}
              </p>
              <p className="text-gray-600">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPG, PNG, PDF, HEIC, WebP • Max 50MB per file
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </button>
          </div>
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Files to Upload ({uploadFiles.length})
            </h3>

            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview}
                        alt={uploadFile.file.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                        {getFileIcon(uploadFile.file.type)}
                      </div>
                    )}

                    <div>
                      <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round(uploadFile.file.size / 1024)} KB • {uploadFile.file.type}
                      </p>
                      {uploadFile.error && (
                        <p className="text-sm text-red-600">{uploadFile.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(uploadFile.status)}

                    {uploadFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {/* Upload Button */}
            {uploadFiles.some(f => f.status === 'pending') && (
              <div className="mt-4">
                <button
                  onClick={uploadFiles}
                  disabled={isUploading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    `Upload ${uploadFiles.filter(f => f.status === 'pending').length} File(s)`
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document List */}
      <DocumentList
        key={refreshKey}
        userId={userId}
        vehicleId={selectedVehicle || 'all'}
        onCreateServiceRecord={handleCreateServiceRecord}
      />
    </div>
  );
}