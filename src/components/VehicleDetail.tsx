'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Car,
  Calendar,
  Gauge,
  AlertTriangle,
  Wrench,
  Plus,
  Edit,
  MessageCircle,
  DollarSign,
  FileText,
  Upload,
  X
} from 'lucide-react';

interface Vehicle {
  id: string;
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  nickname?: string;
  color?: string;
  mileage?: number;
  notes?: string;
  currentValue?: number;
  maintenanceRecords: any[];
  issues: any[];
  _count: {
    maintenanceRecords: number;
    issues: number;
  };
}

interface VehicleDetailProps {
  vehicle: Vehicle;
}

export function VehicleDetail({ vehicle }: VehicleDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedReports, setImportedReports] = useState<any[]>([]);
  const [reportText, setReportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Car },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'issues', name: 'Issues', icon: AlertTriangle },
    { id: 'reports', name: 'Reports', icon: FileText },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Load imported reports when reports tab is activated
  const loadReports = async () => {
    try {
      const response = await fetch(`/api/reports/import?vehicleId=${vehicle.id}`);
      const data = await response.json();
      if (data.success) {
        setImportedReports(data.data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  // Handle report import
  const handleImportReport = async () => {
    if (!reportText.trim()) return;

    setIsImporting(true);
    try {
      const response = await fetch('/api/reports/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          source: 'GoodCar',
          reportType: 'HISTORY_REPORT',
          reportData: reportText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReportText('');
        setShowImportModal(false);
        await loadReports(); // Reload reports
        alert('Report imported successfully!');
      } else {
        alert(`Error importing report: ${data.error}`);
      }
    } catch (error) {
      console.error('Error importing report:', error);
      alert('Error importing report. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  // Load reports when switching to reports tab
  if (activeTab === 'reports' && importedReports.length === 0) {
    loadReports();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim && `• ${vehicle.trim}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">VIN: {vehicle.vin}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/vehicles/${vehicle.id}/chat`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat About This Car
            </Link>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Gauge className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Mileage</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicle.mileage ? vehicle.mileage.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Wrench className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance Records</p>
              <p className="text-2xl font-semibold text-gray-900">{vehicle._count.maintenanceRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Issues</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicle.issues.filter(issue => issue.status === 'OPEN' || issue.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estimated Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {vehicle.currentValue ? formatCurrency(vehicle.currentValue) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Make:</span>
                <span className="font-medium">{vehicle.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              {vehicle.trim && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trim:</span>
                  <span className="font-medium">{vehicle.trim}</span>
                </div>
              )}
              {vehicle.color && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{vehicle.color}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">VIN:</span>
                <span className="font-mono text-sm">{vehicle.vin}</span>
              </div>
            </div>
            {vehicle.notes && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600 text-sm">{vehicle.notes}</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {vehicle.maintenanceRecords.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Wrench className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{record.title}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(record.date)}
                      {record.cost && ` • ${formatCurrency(record.cost)}`}
                    </p>
                  </div>
                </div>
              ))}
              {vehicle.issues.slice(0, 3).map((issue, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    issue.severity === 'HIGH' || issue.severity === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(issue.dateFound)} • {issue.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Records</h3>
              <Link
                href={`/vehicles/${vehicle.id}/maintenance/add`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {vehicle.maintenanceRecords.map((record, index) => (
              <div key={index} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                    <p className="text-gray-600 mt-1">{record.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(record.date)}</span>
                      {record.mileage && <span>{record.mileage.toLocaleString()} miles</span>}
                      {record.serviceBy && <span>Service by: {record.serviceBy}</span>}
                    </div>
                  </div>
                  {record.cost && (
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(record.cost)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {vehicle.maintenanceRecords.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No maintenance records yet. Add your first record to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Issues</h3>
              <Link
                href={`/vehicles/${vehicle.id}/issues/add`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {vehicle.issues.map((issue, index) => (
              <div key={index} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900">{issue.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        issue.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.severity}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.status === 'FIXED' ? 'bg-green-100 text-green-800' :
                        issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{issue.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Found: {formatDate(issue.dateFound)}</span>
                      {issue.mileage && <span>{issue.mileage.toLocaleString()} miles</span>}
                      {issue.dateFixed && <span>Fixed: {formatDate(issue.dateFixed)}</span>}
                    </div>
                  </div>
                  {issue.cost && (
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(issue.cost)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {vehicle.issues.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No issues reported yet. Great job keeping your vehicle in good condition!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Reports Header */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle History Reports</h3>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Report
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Import vehicle history reports from GoodCar, Carfax, AutoCheck, or other sources to get comprehensive vehicle history.
              </p>
            </div>

            {/* Reports List */}
            <div className="divide-y divide-gray-200">
              {importedReports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-medium text-gray-900">{report.source} Report</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.reportType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{report.summary}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Imported on {formatDate(report.importedAt)}
                      </p>

                      {/* Report Summary Stats */}
                      {report.parsedData && report.parsedData.summary && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-lg font-semibold text-gray-900">
                              {report.parsedData.summary.accidentCount}
                            </p>
                            <p className="text-xs text-gray-600">Accidents</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-lg font-semibold text-gray-900">
                              {report.parsedData.summary.ownerCount}
                            </p>
                            <p className="text-xs text-gray-600">Owners</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-lg font-semibold text-gray-900">
                              {report.parsedData.summary.serviceRecordCount}
                            </p>
                            <p className="text-xs text-gray-600">Service Records</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-lg font-semibold text-gray-900">
                              {report.parsedData.summary.recallCount}
                            </p>
                            <p className="text-xs text-gray-600">Recalls</p>
                          </div>
                        </div>
                      )}

                      {/* Key Issues */}
                      {report.parsedData && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Key Findings:</h5>
                          <div className="space-y-1">
                            {report.parsedData.accidents && report.parsedData.accidents.length > 0 && (
                              <p className="text-sm text-red-600">
                                • {report.parsedData.accidents.length} accident(s) reported
                              </p>
                            )}
                            {report.parsedData.summary && !report.parsedData.summary.cleanTitle && (
                              <p className="text-sm text-red-600">• Title issues detected</p>
                            )}
                            {report.parsedData.recalls && report.parsedData.recalls.length > 0 && (
                              <p className="text-sm text-yellow-600">
                                • {report.parsedData.recalls.length} recall(s) found
                              </p>
                            )}
                            {report.parsedData.summary && report.parsedData.summary.cleanTitle &&
                             report.parsedData.summary.accidentCount === 0 && (
                              <p className="text-sm text-green-600">• Clean history - no major issues found</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {importedReports.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No vehicle history reports imported yet.</p>
                  <p className="text-sm mt-1">
                    Get started by importing a report from GoodCar ($2.95) or other vehicle history providers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Vehicle History Report</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-4">
                Copy and paste your vehicle history report from GoodCar, Carfax, AutoCheck, or any other provider.
                The system will automatically parse the key information.
              </p>

              <label htmlFor="reportText" className="block text-sm font-medium text-gray-700 mb-2">
                Report Text/Data
              </label>
              <textarea
                id="reportText"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your vehicle history report here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportReport}
                disabled={!reportText.trim() || isImporting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importing...' : 'Import Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}