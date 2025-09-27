import React, { createContext, useContext, useState } from 'react';
import { projectAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async (params = {}) => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects(params);
      setProjects(response.data.projects);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch projects';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async (projectId) => {
    try {
      setLoading(true);
      const response = await projectAPI.getProject(projectId);
      const project = response.data.project;
      setCurrentProject(project);
      return project;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch project';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      setLoading(true);
      const response = await projectAPI.createProject(projectData);
      const newProject = response.data.project;
      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created successfully!');
      return newProject;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create project';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      setLoading(true);
      const response = await projectAPI.updateProject(projectId, projectData);
      const updatedProject = response.data.project;
      
      setProjects(prev => 
        prev.map(p => p._id === projectId ? updatedProject : p)
      );
      
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Project updated successfully!');
      return updatedProject;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update project';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      await projectAPI.deleteProject(projectId);
      
      setProjects(prev => prev.filter(p => p._id !== projectId));
      
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(null);
      }
      
      toast.success('Project deleted successfully!');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete project';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addProcess = async (projectId, processData) => {
    try {
      setLoading(true);
      const response = await projectAPI.addProcess(projectId, processData);
      const updatedProject = response.data.project;
      
      setProjects(prev => 
        prev.map(p => p._id === projectId ? updatedProject : p)
      );
      
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Process added successfully!');
      return updatedProject;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add process';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProcess = async (projectId, processId, processData) => {
    try {
      setLoading(true);
      const response = await projectAPI.updateProcess(projectId, processId, processData);
      const updatedProject = response.data.project;
      
      setProjects(prev => 
        prev.map(p => p._id === projectId ? updatedProject : p)
      );
      
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Process updated successfully!');
      return updatedProject;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update process';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProcess = async (projectId, processId) => {
    try {
      setLoading(true);
      const response = await projectAPI.deleteProcess(projectId, processId);
      const updatedProject = response.data.project;
      
      setProjects(prev => 
        prev.map(p => p._id === projectId ? updatedProject : p)
      );
      
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Process deleted successfully!');
      return updatedProject;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete process';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    projects,
    currentProject,
    loading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addProcess,
    updateProcess,
    deleteProcess,
    setCurrentProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

