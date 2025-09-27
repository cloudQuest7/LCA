import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  BarChart3, 
  FileText,
  Clock
} from 'lucide-react';

const RecentActivity = ({ projects }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return Plus;
      case 'updated':
        return Edit;
      case 'analyzed':
        return BarChart3;
      case 'reported':
        return FileText;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'created':
        return 'text-success-600 bg-success-100';
      case 'updated':
        return 'text-warning-600 bg-warning-100';
      case 'analyzed':
        return 'text-primary-600 bg-primary-100';
      case 'reported':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Generate mock activity data from projects
  const activities = projects
    .slice(0, 5)
    .map(project => [
      {
        id: `${project._id}-created`,
        type: 'created',
        message: `Created project "${project.name}"`,
        time: project.createdAt,
        projectId: project._id,
        projectName: project.name
      },
      ...(project.analysis?.lastAnalyzed ? [{
        id: `${project._id}-analyzed`,
        type: 'analyzed',
        message: `Analyzed project "${project.name}"`,
        time: project.analysis.lastAnalyzed,
        projectId: project._id,
        projectName: project.name
      }] : []),
      {
        id: `${project._id}-updated`,
        type: 'updated',
        message: `Updated project "${project.name}"`,
        time: project.updatedAt,
        projectId: project._id,
        projectName: project.name
      }
    ])
    .flat()
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.time)}
                    </span>
                    <Link
                      to={`/projects/${activity.projectId}`}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      View project
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
