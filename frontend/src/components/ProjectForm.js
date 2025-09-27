import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { X, Save } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ProjectForm = ({ onClose, project = null, isEdit = false }) => {
  const { createProject, updateProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    industry: project?.industry || 'steel',
    product: project?.product || '',
    functionalUnit: project?.functionalUnit || ''
  });
  const [errors, setErrors] = useState({});

  const industries = [
    { value: 'steel', label: 'Steel' },
    { value: 'aluminum', label: 'Aluminum' },
    { value: 'copper', label: 'Copper' },
    { value: 'gold', label: 'Gold' },
    { value: 'iron_ore', label: 'Iron Ore' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.product.trim()) {
      newErrors.product = 'Product is required';
    }

    if (!formData.functionalUnit.trim()) {
      newErrors.functionalUnit = 'Functional unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit && project) {
        await updateProject(project._id, formData);
      } else {
        await createProject(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Enter project description"
            />
          </div>

          {/* Industry and Product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={`input ${errors.industry ? 'input-error' : ''}`}
              >
                {industries.map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-error-600">{errors.industry}</p>
              )}
            </div>

            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <input
                type="text"
                id="product"
                name="product"
                value={formData.product}
                onChange={handleChange}
                className={`input ${errors.product ? 'input-error' : ''}`}
                placeholder="e.g., Steel beam, Aluminum sheet"
              />
              {errors.product && (
                <p className="mt-1 text-sm text-error-600">{errors.product}</p>
              )}
            </div>
          </div>

          {/* Functional Unit */}
          <div>
            <label htmlFor="functionalUnit" className="block text-sm font-medium text-gray-700 mb-2">
              Functional Unit *
            </label>
            <input
              type="text"
              id="functionalUnit"
              name="functionalUnit"
              value={formData.functionalUnit}
              onChange={handleChange}
              className={`input ${errors.functionalUnit ? 'input-error' : ''}`}
              placeholder="e.g., 1 kg of steel, 1 m² of aluminum sheet"
            />
            <p className="mt-1 text-sm text-gray-500">
              Define the reference unit for your LCA analysis
            </p>
            {errors.functionalUnit && (
              <p className="mt-1 text-sm text-error-600">{errors.functionalUnit}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
