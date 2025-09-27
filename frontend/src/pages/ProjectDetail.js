import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  BarChart3, 
  FileText,
  Trash2,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ProcessForm from '../components/ProcessForm';

const ProjectDetail = () => {
  const { id } = useParams();
  const { currentProject, fetchProject, deleteProject, loading } = useProject();
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(id);
        window.location.href = '/projects';
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleEditProcess = (process) => {
    setEditingProcess(process);
    setShowProcessForm(true);
  };

  const handleCloseProcessForm = () => {
    setShowProcessForm(false);
    setEditingProcess(null);
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
        <p className="text-gray-500 mb-6">The project you're looking for doesn't exist.</p>
        <Link to="/projects" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
            <p className="text-sm text-gray-500">
              {currentProject.industry} • {currentProject.product}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/analysis/${currentProject._id}`}
            className="btn btn-primary"
            disabled={!currentProject.processes?.length}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze
          </Link>
          <button
            onClick={() => setShowProcessForm(true)}
            className="btn btn-outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Process
          </button>
          <button
            onClick={handleDeleteProject}
            className="btn btn-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600">
              {currentProject.description || 'No description provided'}
            </p>
          </div>

          {/* Processes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Processes</h2>
              <span className="badge badge-primary">
                {currentProject.processes?.length || 0} processes
              </span>
            </div>
            
            {currentProject.processes?.length > 0 ? (
              <div className="space-y-4">
                {currentProject.processes.map((process, index) => (
                  <div key={process._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{process.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="badge badge-secondary capitalize">
                          {process.type.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleEditProcess(process)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Raw Materials:</span>
                        <p>{process.rawMaterials?.length || 0} materials</p>
                      </div>
                      <div>
                        <span className="font-medium">Energy:</span>
                        <p>{process.energy?.electricity?.amount || 0} kWh</p>
                      </div>
                      <div>
                        <span className="font-medium">CO₂:</span>
                        <p>{process.impacts?.co2Emissions?.amount || 0} kg</p>
                      </div>
                      <div>
                        <span className="font-medium">Recycled:</span>
                        <p>{process.circularity?.recyclability || 0}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No processes added yet</p>
                <button
                  onClick={() => setShowProcessForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Process
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Industry</span>
                <p className="text-gray-900 capitalize">{currentProject.industry}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Product</span>
                <p className="text-gray-900">{currentProject.product}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Functional Unit</span>
                <p className="text-gray-900">{currentProject.functionalUnit}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`badge ${
                  currentProject.status === 'completed' ? 'badge-success' :
                  currentProject.status === 'in_progress' ? 'badge-warning' :
                  'badge-secondary'
                }`}>
                  {currentProject.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created</span>
                <p className="text-gray-900">
                  {new Date(currentProject.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {currentProject.analysis && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Circularity Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${currentProject.analysis.circularityScore || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentProject.analysis.circularityScore?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Total CO₂</span>
                  <p className="text-gray-900">
                    {currentProject.analysis.totalCO2?.toFixed(2) || 0} kg CO₂ eq
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Total Energy</span>
                  <p className="text-gray-900">
                    {currentProject.analysis.totalEnergy?.toFixed(2) || 0} kWh
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Recycling Rate</span>
                  <p className="text-gray-900">
                    {currentProject.analysis.overallRecyclingRate?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Form Modal */}
      {showProcessForm && (
        <ProcessForm
          projectId={currentProject._id}
          process={editingProcess}
          onClose={handleCloseProcessForm}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
