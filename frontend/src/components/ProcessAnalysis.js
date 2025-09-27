import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const ProcessAnalysis = ({ processes, analysisResults }) => {
  const processData = processes.map((process, index) => ({
    name: process.name,
    co2: process.impacts?.co2Emissions?.amount || process.predictions?.predictedCO2 || 0,
    energy: process.energy?.electricity?.amount || process.predictions?.predictedEnergy || 0,
    recycling: process.circularity?.recyclability || process.predictions?.predictedRecyclingRate || 0,
    circularity: process.predictions?.predictedCircularityScore || 0,
    confidence: process.predictions?.confidence ? process.predictions.confidence * 100 : 0
  }));

  const pathwayData = processes.reduce((acc, process) => {
    const pathway = process.predictions?.pathwayClassification || 'unknown';
    acc[pathway] = (acc[pathway] || 0) + 1;
    return acc;
  }, {});

  const pathwayChartData = Object.entries(pathwayData).map(([pathway, count]) => ({
    pathway: pathway.charAt(0).toUpperCase() + pathway.slice(1),
    count,
    percentage: (count / processes.length) * 100
  }));

  return (
    <div className="space-y-6">
      {/* Process Environmental Impact */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Environmental Impact</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="co2" fill="#ef4444" name="CO₂ (kg)" />
              <Bar dataKey="energy" fill="#f59e0b" name="Energy (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Circularity and Recycling */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Circularity and Recycling</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="circularity" fill="#22c55e" name="Circularity %" />
              <Bar dataKey="recycling" fill="#3b82f6" name="Recycling %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pathway Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Pathway Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathwayChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pathway" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {pathwayChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    item.pathway === 'Circular' ? 'bg-green-500' :
                    item.pathway === 'Linear' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <span className="font-medium text-gray-900">{item.pathway}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Confidence Scores */}
      {analysisResults && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Confidence</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Confidence %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Process Details Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CO₂ (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Energy (kWh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Circularity %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recycling %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processData.map((process, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {process.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.co2.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.energy.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.circularity.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.recycling.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.confidence.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcessAnalysis;
