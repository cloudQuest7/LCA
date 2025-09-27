import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { X, Save, Plus, Minus } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ProcessForm = ({ projectId, process = null, onClose }) => {
  const { addProcess, updateProcess } = useProject();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: process?.name || '',
    type: process?.type || 'mining',
    rawMaterials: process?.rawMaterials || [],
    energy: process?.energy || { electricity: {}, fuel: {} },
    impacts: process?.impacts || { co2Emissions: {}, waterUse: {}, waste: {} },
    circularity: process?.circularity || {},
    transport: process?.transport || {},
    endOfLife: process?.endOfLife || {},
    dataQuality: process?.dataQuality || 'medium',
    source: process?.source || '',
    notes: process?.notes || ''
  });
  const [errors, setErrors] = useState({});

  const processTypes = [
    { value: 'mining', label: 'Mining' },
    { value: 'processing', label: 'Processing' },
    { value: 'transport', label: 'Transport' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'end_of_life', label: 'End of Life' }
  ];

  const dataQualityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRawMaterialChange = (index, field, value) => {
    const newMaterials = [...formData.rawMaterials];
    newMaterials[index] = {
      ...newMaterials[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      rawMaterials: newMaterials
    }));
  };

  const addRawMaterial = () => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: [
        ...prev.rawMaterials,
        { name: '', amount: 0, unit: 'kg', source: 'virgin', recycledContent: 0 }
      ]
    }));
  };

  const removeRawMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Process name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Process type is required';
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
      
      if (process) {
        await updateProcess(projectId, process._id, formData);
      } else {
        await addProcess(projectId, formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving process:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {process ? 'Edit Process' : 'Add New Process'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Process Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter process name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Process Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`input ${errors.type ? 'input-error' : ''}`}
              >
                {processTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-error-600">{errors.type}</p>
              )}
            </div>
          </div>

          {/* Raw Materials */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Raw Materials</h3>
              <button
                type="button"
                onClick={addRawMaterial}
                className="btn btn-outline text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Material
              </button>
            </div>
            
            {formData.rawMaterials.map((material, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Material {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeRawMaterial(index)}
                    className="text-error-600 hover:text-error-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Name
                    </label>
                    <input
                      type="text"
                      value={material.name}
                      onChange={(e) => handleRawMaterialChange(index, 'name', e.target.value)}
                      className="input"
                      placeholder="e.g., Iron ore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={material.amount}
                      onChange={(e) => handleRawMaterialChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={material.unit}
                      onChange={(e) => handleRawMaterialChange(index, 'unit', e.target.value)}
                      className="input"
                    >
                      <option value="kg">kg</option>
                      <option value="tonnes">tonnes</option>
                      <option value="m³">m³</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <select
                      value={material.source}
                      onChange={(e) => handleRawMaterialChange(index, 'source', e.target.value)}
                      className="input"
                    >
                      <option value="virgin">Virgin</option>
                      <option value="recycled">Recycled</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recycled Content (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={material.recycledContent}
                      onChange={(e) => handleRawMaterialChange(index, 'recycledContent', parseFloat(e.target.value) || 0)}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Energy Consumption */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Energy Consumption</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Electricity (kWh)
                </label>
                <input
                  type="number"
                  name="energy.electricity.amount"
                  value={formData.energy.electricity.amount || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel (L)
                </label>
                <input
                  type="number"
                  name="energy.fuel.amount"
                  value={formData.energy.fuel.amount || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Environmental Impacts */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Impacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CO₂ Emissions (kg CO₂ eq)
                </label>
                <input
                  type="number"
                  name="impacts.co2Emissions.amount"
                  value={formData.impacts.co2Emissions.amount || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Use (L)
                </label>
                <input
                  type="number"
                  name="impacts.waterUse.amount"
                  value={formData.impacts.waterUse.amount || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste (kg)
                </label>
                <input
                  type="number"
                  name="impacts.waste.amount"
                  value={formData.impacts.waste.amount || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Circularity Indicators */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Circularity Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recyclability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="circularity.recyclability"
                  value={formData.circularity.recyclability || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reusability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="circularity.reusability"
                  value={formData.circularity.reusability || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durability (years)
                </label>
                <input
                  type="number"
                  name="circularity.durability"
                  value={formData.circularity.durability || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repairability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="circularity.repairability"
                  value={formData.circularity.repairability || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Data Quality and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Quality
              </label>
              <select
                name="dataQuality"
                value={formData.dataQuality}
                onChange={handleChange}
                className="input"
              >
                {dataQualityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="input"
                placeholder="Data source"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Additional notes about this process"
            />
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
                  {process ? 'Update Process' : 'Add Process'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessForm;
