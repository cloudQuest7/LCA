import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CircularityChart = ({ circularityScore = 75, recyclingRate = 80, processMetrics = [] }) => {
  // Hard-coded values for demonstration
  const staticCircularityScore = 75;  // 75% circularity
  const staticRecyclingRate = 80;     // 80% recycling rate

  const circularityData = [
    { name: 'Circular', value: staticCircularityScore, color: '#22c55e' },
    { name: 'Linear', value: 100 - staticCircularityScore, color: '#ef4444' }
  ];

  const recyclingData = [
    { name: 'Recycled', value: staticRecyclingRate, color: '#3b82f6' },
    { name: 'Virgin', value: 100 - staticRecyclingRate, color: '#6b7280' }
  ];

  const processData = [
    { name: 'Mining', circularity: 65, recycling: 70 },
    { name: 'Processing', circularity: 80, recycling: 85 },
    { name: 'Transport', circularity: 60, recycling: 65 },
    { name: 'Manufacturing', circularity: 75, recycling: 80 },
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
                  animationBegin={0}
                  animationDuration={1500}
                  animateNewValues={true}
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
              {staticCircularityScore.toFixed(1)}%
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
                  animationBegin={0}
                  animationDuration={1500}
                  animateNewValues={true}
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
              {staticRecyclingRate.toFixed(1)}%
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
              <Bar 
                dataKey="circularity" 
                fill="#22c55e" 
                name="Circularity %"
                animationBegin={0}
                animationDuration={1500}
              />
              <Bar 
                dataKey="recycling" 
                fill="#3b82f6" 
                name="Recycling %"
                animationBegin={200}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CircularityChart;
