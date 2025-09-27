import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Clock,
  Leaf,
  ArrowRight
} from 'lucide-react';

const ProjectCard = ({ project }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-warning';
      case 'draft':
        return 'badge-secondary';
      case 'archived':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const getIndustryIcon = (industry) => {
    switch (industry) {
      case 'steel':
        return '🔩';
      case 'aluminum':
        return '🛩️';
      case 'copper':
        return '🔌';
      case 'gold':
        return '🥇';
      case 'iron_ore':
        return '⛏️';
      default:
        return '🏭';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getIndustryIcon(project.industry)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{project.industry} • {project.product}</p>
          </div>
        </div>
        <span className={`badge ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description || 'No description provided'}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>{project.processes?.length || 0} processes</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{project.collaborators?.length || 0} collaborators</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(project.updatedAt)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{project.analysis?.lastAnalyzed ? formatDate(project.analysis.lastAnalyzed) : 'Not analyzed'}</span>
        </div>
      </div>

      {project.analysis && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Circularity Score</span>
            <span className="font-semibold text-gray-900">
              {project.analysis.circularityScore?.toFixed(1) || 'N/A'}/100
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.analysis.circularityScore || 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Link
            to={`/projects/${project._id}`}
            className="btn btn-outline text-sm"
          >
            View Details
          </Link>
          {project.processes?.length > 0 && (
            <Link
              to={`/analysis/${project._id}`}
              className="btn btn-primary text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Analyze
            </Link>
          )}
        </div>
        <Link
          to={`/projects/${project._id}`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
