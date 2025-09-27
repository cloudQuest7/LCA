import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { reportsAPI } from '../services/api';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Plus,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
  const { id } = useParams();
  const { currentProject, fetchProject } = useProject();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
      fetchReports();
    }
  }, [id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports(id);
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format = 'json') => {
    try {
      setGenerating(true);
      const response = await reportsAPI.generateReport(id, { format });
      const newReport = response.data.report;
      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await reportsAPI.downloadReport(id, reportId);
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lca-report-${reportId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentProject) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/projects/${id}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">{currentProject.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => generateReport('json')}
            disabled={generating || !currentProject.analysis?.lastAnalyzed}
            className="btn btn-primary"
          >
            {generating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Analysis Status Check */}
      {!currentProject.analysis?.lastAnalyzed && (
        <div className="card bg-warning-50 border-warning-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-warning-600" />
            <div>
              <h3 className="font-medium text-warning-800">Analysis Required</h3>
              <p className="text-sm text-warning-700">
                Run analysis on your project before generating reports.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to={`/analysis/${id}`}
              className="btn btn-warning"
            >
              Run Analysis
            </Link>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner size="lg" className="mt-20" />
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.projectName} - Sustainability Report
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(report.generatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{report.generatedBy}</span>
                      </div>
                      <span className="badge badge-primary">
                        {report.format.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadReport(report.id)}
                    className="btn btn-outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
              
              {/* Report Preview */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {report.content?.executiveSummary?.overview || 'No summary available'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Total CO₂:</span>
                    <p className="text-gray-900">
                      {report.content?.executiveSummary?.keyMetrics?.totalCO2Emissions || 0} kg CO₂ eq
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Energy:</span>
                    <p className="text-gray-900">
                      {report.content?.executiveSummary?.keyMetrics?.totalEnergyConsumption || 0} kWh
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Recycling Rate:</span>
                    <p className="text-gray-900">
                      {report.content?.executiveSummary?.keyMetrics?.overallRecyclingRate || 0}%
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Rating:</span>
                    <span className={`badge ${
                      report.content?.executiveSummary?.sustainabilityRating === 'A' ? 'badge-success' :
                      report.content?.executiveSummary?.sustainabilityRating === 'B' ? 'badge-success' :
                      report.content?.executiveSummary?.sustainabilityRating === 'C' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {report.content?.executiveSummary?.sustainabilityRating || 'F'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
          <p className="text-gray-500 mb-6">
            Generate your first sustainability report to get detailed insights.
          </p>
          <button
            onClick={() => generateReport('json')}
            disabled={generating || !currentProject.analysis?.lastAnalyzed}
            className="btn btn-primary"
          >
            {generating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;
