import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  FolderOpen, 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Clock,
  Users,
  Target
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';
import QuickStats from '../components/QuickStats';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
  const { projects, fetchProjects, loading } = useProject();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalProcesses: 0,
    avgCircularityScore: 0
  });

  useEffect(() => {
    fetchProjects({ limit: 10 });
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      calculateStats();
    }
  }, [projects]);

  const calculateStats = () => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalProcesses = projects.reduce((sum, p) => sum + (p.processes?.length || 0), 0);
    const avgCircularityScore = projects.reduce((sum, p) => 
      sum + (p.analysis?.circularityScore || 0), 0) / totalProjects || 0;

    setStats({
      totalProjects,
      completedProjects,
      totalProcesses,
      avgCircularityScore
    });
  };

  const recentProjects = projects.slice(0, 6);

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.profile?.firstName || 'User'}!
            </h1>
            <p className="mt-2 text-primary-100">
              Ready to conduct your next Life Cycle Assessment?
            </p>
          </div>
          <div className="hidden md:block">
            <Leaf className="w-24 h-24 text-primary-200" />
          </div>
        </div>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                <Link
                  to="/projects"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first LCA project
                  </p>
                  <Link
                    to="/projects"
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link
                to="/projects"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Plus className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Project</p>
                  <p className="text-sm text-gray-500">Start a new LCA analysis</p>
                </div>
              </Link>
              <Link
                to="/projects"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-success-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Analysis</p>
                  <p className="text-sm text-gray-500">Check your project results</p>
                </div>
              </Link>
              <Link
                to="/projects"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-warning-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Compare Projects</p>
                  <p className="text-sm text-gray-500">Analyze different scenarios</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
