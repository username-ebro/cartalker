'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Calendar, DollarSign, Car, Filter, CheckCircle } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'DEFERRED' | 'WONT_FIX';
  cost?: number;
  mileage?: number;
  dateFound: string;
  dateFixed?: string;
  fixedBy?: string;
  vehicle: {
    id: string;
    nickname?: string;
    make?: string;
    model?: string;
    year?: number;
  };
}

export function IssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      const data = await response.json();

      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FIXED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DEFERRED': return 'bg-purple-100 text-purple-800';
      case 'WONT_FIX': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesText = issue.title.toLowerCase().includes(filter.toLowerCase()) ||
      issue.description.toLowerCase().includes(filter.toLowerCase()) ||
      (issue.vehicle.nickname && issue.vehicle.nickname.toLowerCase().includes(filter.toLowerCase())) ||
      (issue.vehicle.make && issue.vehicle.make.toLowerCase().includes(filter.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;

    return matchesText && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const openIssues = issues.filter(issue => issue.status === 'OPEN' || issue.status === 'IN_PROGRESS');
  const fixedIssues = issues.filter(issue => issue.status === 'FIXED');

  return (
    <div>
      {/* Filters and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search issues..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FIXED">Fixed</option>
            <option value="DEFERRED">Deferred</option>
            <option value="WONT_FIX">Won't Fix</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{openIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fixed Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{fixedIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Repair Costs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(issues.reduce((sum, issue) => sum + (issue.cost || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? 'text-red-600' :
                    issue.severity === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{issue.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-1" />
                    <Link
                      href={`/vehicles/${issue.vehicle.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {issue.vehicle.nickname ||
                       `${issue.vehicle.year} ${issue.vehicle.make} ${issue.vehicle.model}`}
                    </Link>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Found: {formatDate(issue.dateFound)}
                  </div>

                  {issue.dateFixed && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Fixed: {formatDate(issue.dateFixed)}
                    </div>
                  )}

                  {issue.mileage && (
                    <div className="flex items-center">
                      <span>{issue.mileage.toLocaleString()} miles</span>
                    </div>
                  )}

                  {issue.fixedBy && (
                    <div className="flex items-center">
                      <span>Fixed by: {issue.fixedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {issue.cost && (
                <div className="text-right">
                  <div className="flex items-center text-lg font-semibold text-gray-900">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {formatCurrency(issue.cost)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter || statusFilter !== 'ALL' ? 'No issues found' : 'No issues reported yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter || statusFilter !== 'ALL'
                ? 'Try adjusting your search terms or filters.'
                : 'Great! No issues have been reported for your vehicles.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}