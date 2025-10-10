'use client';

import { useState } from 'react';
import { Check, X, Edit2, AlertCircle } from 'lucide-react';

export interface ReceiptData {
  date?: string;
  service?: string;
  mileage?: number;
  cost?: number;
  shop?: string;
  vehicleId?: string;
}

interface ReceiptValidationProps {
  /** Extracted receipt data from OCR */
  data: ReceiptData;
  /** Image source (base64 or URL) of the receipt */
  imageSrc?: string;
  /** Callback when user confirms data is correct */
  onConfirm: (data: ReceiptData) => void;
  /** Callback when user rejects/cancels */
  onReject: () => void;
  /** Whether validation is in progress */
  isLoading?: boolean;
}

/**
 * ReceiptValidation Component
 *
 * Displays OCR-extracted receipt data and asks "Does this look right?"
 * Allows user to edit fields before confirming.
 *
 * Critical for data accuracy - we don't want wrong data in the database.
 */
export function ReceiptValidation({
  data: initialData,
  imageSrc,
  onConfirm,
  onReject,
  isLoading = false,
}: ReceiptValidationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ReceiptData>(initialData);

  const handleEdit = (field: keyof ReceiptData, value: string | number) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    onConfirm(editedData);
  };

  const hasChanges = JSON.stringify(editedData) !== JSON.stringify(initialData);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg border-2 border-marble-gray shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-yellow-highlight/30 border-b-2 border-marble-gray p-4 flex items-center gap-3">
        <AlertCircle className="text-warning-amber" size={24} />
        <div>
          <h3 className="font-mono font-bold text-lg text-notebook-black">
            Does this look right?
          </h3>
          <p className="text-sm text-marble-gray">
            We extracted this info from your receipt. Please verify before saving.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Receipt Image Preview */}
        {imageSrc && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-marble-gray uppercase tracking-wide">
              Receipt Image
            </label>
            <div className="border-2 border-marble-gray rounded overflow-hidden">
              <img
                src={imageSrc}
                alt="Receipt"
                className="w-full h-auto max-h-64 object-contain bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Extracted Data Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-marble-gray uppercase tracking-wide">
              Extracted Data
            </label>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-xs text-info-blue hover:text-blue-700 transition-colors"
            >
              <Edit2 size={14} />
              {isEditing ? 'Done Editing' : 'Edit'}
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-notebook-black mb-1">
              Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={editedData.date || ''}
                onChange={(e) => handleEdit('date', e.target.value)}
                className="w-full px-3 py-2 border-2 border-marble-gray rounded focus:border-info-blue focus:outline-none"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-notebook-black">
                {editedData.date || 'Not specified'}
              </div>
            )}
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-notebook-black mb-1">
              Service Type
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.service || ''}
                onChange={(e) => handleEdit('service', e.target.value)}
                placeholder="e.g., Oil change, Tire rotation"
                className="w-full px-3 py-2 border-2 border-marble-gray rounded focus:border-info-blue focus:outline-none"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-notebook-black">
                {editedData.service || 'Not specified'}
              </div>
            )}
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-notebook-black mb-1">
              Mileage
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editedData.mileage || ''}
                onChange={(e) => handleEdit('mileage', parseInt(e.target.value) || 0)}
                placeholder="e.g., 45234"
                className="w-full px-3 py-2 border-2 border-marble-gray rounded focus:border-info-blue focus:outline-none"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-notebook-black">
                {editedData.mileage ? editedData.mileage.toLocaleString() + ' miles' : 'Not specified'}
              </div>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-notebook-black mb-1">
              Cost
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-notebook-black">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={editedData.cost || ''}
                  onChange={(e) => handleEdit('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border-2 border-marble-gray rounded focus:border-info-blue focus:outline-none"
                />
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-notebook-black">
                {editedData.cost ? `$${editedData.cost.toFixed(2)}` : 'Not specified'}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <label className="block text-sm font-medium text-notebook-black mb-1">
              Shop/Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.shop || ''}
                onChange={(e) => handleEdit('shop', e.target.value)}
                placeholder="e.g., Delta Tire, Jiffy Lube"
                className="w-full px-3 py-2 border-2 border-marble-gray rounded focus:border-info-blue focus:outline-none"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-notebook-black">
                {editedData.shop || 'Not specified'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t-2 border-marble-gray bg-gray-50 p-4 flex items-center justify-between gap-4">
        {hasChanges && (
          <p className="text-xs text-warning-amber flex items-center gap-1">
            <AlertCircle size={14} />
            You've made changes to the extracted data
          </p>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {/* Reject Button */}
          <button
            type="button"
            onClick={onReject}
            disabled={isLoading}
            className="px-6 py-2 border-2 border-marble-gray text-notebook-black bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
            Cancel
          </button>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-savings-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                {hasChanges ? 'Save Changes' : 'Looks Good!'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
