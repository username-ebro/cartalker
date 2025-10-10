'use client';

import React, { useState, useCallback } from 'react';
import { FileText, Eye, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { parseDocumentText, ParsedDocumentData } from '@/utils/documentParser';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  filePath: string;
  thumbnailPath?: string;
  category: string;
  type: string;
  processingStatus: string;
  ocrText?: string;
  extractedData?: string;
  createdAt: string;
  vehicle?: {
    id: string;
    year?: number;
    make?: string;
    model?: string;
    nickname?: string;
  };
}

interface DocumentProcessorProps {
  document: Document;
  onProcessingComplete: (documentId: string, result: ProcessingResult) => void;
  onCreateServiceRecord?: (data: ParsedDocumentData) => void;
}

interface ProcessingResult {
  success: boolean;
  ocrText?: string;
  extractedData?: ParsedDocumentData;
  error?: string;
}

export function DocumentProcessor({
  document,
  onProcessingComplete,
  onCreateServiceRecord
}: DocumentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedDocumentData | null>(null);
  const [showOcrText, setShowOcrText] = useState(false);
  const [error, setError] = useState<string>('');

  const processDocument = useCallback(async () => {
    if (document.processingStatus === 'COMPLETED' || isProcessing) return;

    setIsProcessing(true);
    setError('');
    setProcessingProgress(0);
    setProcessingStage('Initializing OCR...');

    try {
      // Only process images for OCR
      if (!document.fileType.startsWith('image/')) {
        throw new Error('OCR processing only supports image files');
      }

      setProcessingStage('Loading image...');
      setProcessingProgress(10);

      // Perform OCR using Tesseract.js
      const result = await Tesseract.recognize(
        document.filePath,
        'eng',
        {
          logger: (info) => {
            if (info.status === 'recognizing text') {
              setProcessingProgress(20 + (info.progress * 60)); // 20-80%
              setProcessingStage(`Recognizing text... ${Math.round(info.progress * 100)}%`);
            }
          }
        }
      );

      setProcessingStage('Parsing extracted text...');
      setProcessingProgress(85);

      const ocrText = result.data.text;
      setOcrResult(ocrText);

      // Parse the extracted text
      const extractedData = parseDocumentText(ocrText);
      setParsedData(extractedData);

      setProcessingStage('Processing complete!');
      setProcessingProgress(100);

      // Call completion callback
      onProcessingComplete(document.id, {
        success: true,
        ocrText,
        extractedData
      });

      // Update document status in database
      await updateDocumentStatus(document.id, ocrText, extractedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setProcessingStage('Processing failed');

      onProcessingComplete(document.id, {
        success: false,
        error: errorMessage
      });

      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [document, isProcessing, onProcessingComplete]);

  const updateDocumentStatus = async (
    documentId: string,
    ocrText: string,
    extractedData: ParsedDocumentData
  ) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText,
          extractedData,
          processingStatus: 'COMPLETED'
        }),
      });

      if (!response.ok) {
        console.error('Failed to update document status');
      }
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const handleCreateServiceRecord = () => {
    if (parsedData && onCreateServiceRecord) {
      onCreateServiceRecord(parsedData);
    }
  };

  const getProcessingStatusIcon = () => {
    if (isProcessing) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }

    switch (document.processingStatus) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProcessingStatusText = () => {
    if (isProcessing) return processingStage;

    switch (document.processingStatus) {
      case 'COMPLETED':
        return 'Processing complete';
      case 'FAILED':
        return 'Processing failed';
      case 'PENDING':
        return 'Ready to process';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {document.thumbnailPath ? (
            <img
              src={document.thumbnailPath}
              alt={document.originalName}
              className="w-16 h-16 object-cover rounded border"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900">{document.originalName}</h3>
            <p className="text-sm text-gray-500">
              {document.category.replace(/_/g, ' ').toLowerCase()} • {(document as any).fileSize ? `${Math.round((document as any).fileSize / 1024)} KB` : 'Unknown size'}
            </p>
            {document.vehicle && (
              <p className="text-xs text-gray-400">
                {document.vehicle.year} {document.vehicle.make} {document.vehicle.model} {document.vehicle.nickname}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getProcessingStatusIcon()}
          <span className="text-sm text-gray-600">{getProcessingStatusText()}</span>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">{processingStage}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Process Button */}
      {document.processingStatus === 'PENDING' && !isProcessing && (
        <button
          onClick={processDocument}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Process Document
        </button>
      )}

      {/* Extracted Data Display */}
      {parsedData && (
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-gray-900">Extracted Information</h4>

          {/* Summary */}
          <div className="bg-blue-50 rounded-md p-3">
            <p className="text-sm text-blue-800 font-medium">Summary:</p>
            <p className="text-sm text-blue-700">{parsedData.summary}</p>
            <p className="text-xs text-blue-600 mt-1">Confidence: {Math.round(parsedData.confidence * 100)}%</p>
          </div>

          {/* Key Data Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedData.dates.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs font-medium text-gray-600 uppercase">Date</p>
                <p className="text-sm text-gray-900">{parsedData.dates[0].date.toLocaleDateString()}</p>
              </div>
            )}

            {parsedData.amounts.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs font-medium text-gray-600 uppercase">Amount</p>
                <p className="text-sm text-gray-900">${parsedData.amounts[0].amount.toFixed(2)}</p>
              </div>
            )}

            {parsedData.mileage.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs font-medium text-gray-600 uppercase">Mileage</p>
                <p className="text-sm text-gray-900">{parsedData.mileage[0].mileage.toLocaleString()} miles</p>
              </div>
            )}

            {parsedData.serviceTypes.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs font-medium text-gray-600 uppercase">Service Type</p>
                <p className="text-sm text-gray-900">
                  {parsedData.serviceTypes[0].serviceType.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowOcrText(!showOcrText)}
              className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showOcrText ? 'Hide' : 'View'} OCR Text
            </button>

            {onCreateServiceRecord && (
              <button
                onClick={handleCreateServiceRecord}
                className="flex items-center justify-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Service Record
              </button>
            )}
          </div>

          {/* OCR Text Display */}
          {showOcrText && ocrResult && (
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs font-medium text-gray-600 uppercase mb-2">Raw OCR Text</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {ocrResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}