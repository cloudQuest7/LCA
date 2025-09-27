import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CircularityChart = ({ circularityScore, recyclingRate }) => {
  const circularityData = [
    { name: 'Circular', value: circularityScore, color: '#22c55e' },
    { name: 'Linear', value: 100 - circularityScore, color: '#ef4444' }
  ];

  const recyclingData = [
    { name: 'Recycled', value: recyclingRate, color: '#3b82f6' },
    { name: 'Virgin', value: 100 - recyclingRate, color: '#6b7280' }
  ];

  const processData = [
    { name: 'Mining', circularity: 45, recycling: 60 },
    { name: 'Processing', circularity: 70, recycling: 80 },
    { name: 'Transport', circularity: 30, recycling: 20 },
    { name: 'Manufacturing', circularity: 65, recycling: 75 },
    { name: 'End of Life', circularity: 85, recycling: 90 }
  ];

  return (
    <div className="space-y-6">
      {/* Circularity Score */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Overall Circularity Score</h4>
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={circularityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {circularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {circularityScore.toFixed(1)}%
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Circular Processes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Linear Processes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recycling Rate */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Material Recycling Rate</h4>
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recyclingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {recyclingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {recyclingRate.toFixed(1)}%
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Recycled Materials</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Virgin Materials</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Comparison */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Process Comparison</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="circularity" fill="#22c55e" name="Circularity %" />
              <Bar dataKey="recycling" fill="#3b82f6" name="Recycling %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CircularityChart;
