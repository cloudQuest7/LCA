import React from 'react';
import { 
  FolderOpen, 
  CheckCircle, 
  BarChart3, 
  TrendingUp 
} from 'lucide-react';

const QuickStats = ({ stats }) => {
  const statItems = [
    {
      name: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'Completed',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      name: 'Total Processes',
      value: stats.totalProcesses,
      icon: BarChart3,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      name: 'Avg Circularity',
      value: `${stats.avgCircularityScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-error-600',
      bgColor: 'bg-error-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{item.name}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
