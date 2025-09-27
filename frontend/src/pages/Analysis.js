import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { analysisAPI } from '../services/api';
import { 
  ArrowLeft, 
  Play, 
  BarChart3, 
  TrendingUp, 
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import CircularityChart from '../components/CircularityChart';
import ProcessAnalysis from '../components/ProcessAnalysis';
import Recommendations from '../components/Recommendations';

const Analysis = () => {
  const { id } = useParams();
  const { currentProject, fetchProject } = useProject();
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await analysisAPI.runAnalysis(id);
      setAnalysisResults(response.data);
      
      // Refresh project data to get updated analysis
      await fetchProject(id);
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getCircularityColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  const getSustainabilityRating = (rating) => {
    const colors = {
      'A': 'text-success-600 bg-success-100',
      'B': 'text-success-600 bg-success-100',
      'C': 'text-warning-600 bg-warning-100',
      'D': 'text-warning-600 bg-warning-100',
      'F': 'text-error-600 bg-error-100'
    };
    return colors[rating] || 'text-gray-600 bg-gray-100';
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
            <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
            <p className="text-sm text-gray-500">{currentProject.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={runAnalysis}
            disabled={analyzing || !currentProject.processes?.length}
            className="btn btn-primary"
          >
            {analyzing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
          <Link
            to={`/reports/${id}`}
            className="btn btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Link>
        </div>
      </div>

      {/* Analysis Status */}
      {!currentProject.analysis?.lastAnalyzed && !analysisResults && (
        <div className="card bg-warning-50 border-warning-200">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 text-warning-600" />
            <div>
              <h3 className="font-medium text-warning-800">Analysis Required</h3>
              <p className="text-sm text-warning-700">
                Run analysis to get insights about your project's environmental impact and circularity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {(currentProject.analysis?.lastAnalyzed || analysisResults) && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Circularity Score</p>
                  <p className={`text-2xl font-bold ${getCircularityColor(75)}`}>
                    75.0%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total CO₂</p>
                  <p className="text-2xl font-bold text-gray-900">
                    13.00 kg
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-error-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Energy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    250.00 kWh
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-warning-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Sustainability</p>
                  <span className={`badge ${getSustainabilityRating('B')}`}>
                    B
                  </span>
                </div>
                <Eye className="w-8 h-8 text-success-600" />
              </div>
            </div>
          </div>

          {/* Circularity Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Circularity Overview</h3>
              <CircularityChart 
                circularityScore={currentProject.analysis?.circularityScore || 0}
                recyclingRate={currentProject.analysis?.overallRecyclingRate || 0}
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Classification</h3>
              <div className="space-y-4">
                {currentProject.processes?.map((process, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{process.name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {process.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        process.predictions?.pathwayClassification === 'circular' ? 'badge-success' :
                        process.predictions?.pathwayClassification === 'hybrid' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {process.predictions?.pathwayClassification || 'Not analyzed'}
                      </span>
                      {process.predictions?.confidence && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(process.predictions.confidence * 100).toFixed(0)}% confidence
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Process Analysis */}
          <ProcessAnalysis 
            processes={currentProject.processes || []}
            analysisResults={analysisResults}
          />

          {/* Recommendations */}
          <Recommendations 
            analysis={currentProject.analysis}
            processes={currentProject.processes || []}
          />
        </div>
      )}

      {/* No Processes Warning */}
      {!currentProject.processes?.length && (
        <div className="card bg-gray-50 border-gray-200">
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Processes to Analyze</h3>
            <p className="text-gray-500 mb-6">
              Add processes to your project before running analysis.
            </p>
            <Link
              to={`/projects/${id}`}
              className="btn btn-primary"
            >
              Add Processes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
