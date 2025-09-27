import React from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Target,
  Zap
} from 'lucide-react';

const Recommendations = ({ analysis, processes }) => {
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Circularity recommendations
    if (analysis?.circularityScore < 50) {
      recommendations.push({
        type: 'high',
        category: 'circularity',
        title: 'Improve Circularity Score',
        description: 'Your current circularity score is below industry standards. Focus on increasing material recycling and designing for reusability.',
        impact: 'Potential 20-30% reduction in environmental impact',
        icon: Target,
        actions: [
          'Increase use of recycled materials in production',
          'Design products for easier disassembly and repair',
          'Implement closed-loop material recovery systems',
          'Partner with recycling facilities for end-of-life processing'
        ]
      });
    }

    // Recycling rate recommendations
    if (analysis?.overallRecyclingRate < 70) {
      recommendations.push({
        type: 'medium',
        category: 'recycling',
        title: 'Increase Recycling Rates',
        description: 'Your recycling rates are below best practice levels. Implement better material recovery and end-of-life management.',
        impact: 'Improve resource efficiency and reduce waste generation',
        icon: TrendingUp,
        actions: [
          'Implement automated sorting systems',
          'Educate consumers about proper disposal',
          'Develop take-back programs for products',
          'Invest in advanced recycling technologies'
        ]
      });
    }

    // CO2 emissions recommendations
    if (analysis?.totalCO2 > 1000) {
      recommendations.push({
        type: 'high',
        category: 'emissions',
        title: 'Reduce CO₂ Emissions',
        description: 'Your CO₂ emissions are above recommended levels. Focus on energy efficiency and renewable energy sources.',
        impact: 'Significant reduction in carbon footprint',
        icon: Zap,
        actions: [
          'Switch to renewable energy sources',
          'Optimize process efficiency',
          'Implement carbon capture technologies',
          'Use low-carbon transportation methods'
        ]
      });
    }

    // Process-specific recommendations
    const linearProcesses = processes.filter(p => 
      p.predictions?.pathwayClassification === 'linear'
    );
    
    if (linearProcesses.length > 0) {
      recommendations.push({
        type: 'medium',
        category: 'process',
        title: 'Transform Linear Processes',
        description: `${linearProcesses.length} processes are classified as linear. Transform them to circular pathways.`,
        impact: 'Move towards circular economy principles',
        icon: ArrowRight,
        actions: [
          'Redesign processes to minimize waste',
          'Implement material recovery systems',
          'Use renewable or recycled inputs',
          'Design for product longevity and reusability'
        ]
      });
    }

    // Data quality recommendations
    const lowConfidenceProcesses = processes.filter(p => 
      p.predictions?.confidence < 0.7
    );
    
    if (lowConfidenceProcesses.length > 0) {
      recommendations.push({
        type: 'low',
        category: 'data',
        title: 'Improve Data Quality',
        description: `${lowConfidenceProcesses.length} processes have low prediction confidence. Collect more accurate data.`,
        impact: 'Improve analysis accuracy and reliability',
        icon: AlertTriangle,
        actions: [
          'Collect more detailed process data',
          'Use industry-standard measurement methods',
          'Implement real-time monitoring systems',
          'Validate data with third-party sources'
        ]
      });
    }

    // Industry-specific recommendations
    const industryRecommendations = {
      steel: {
        title: 'Steel Industry Best Practices',
        description: 'Implement electric arc furnaces and increase scrap steel usage.',
        actions: [
          'Use electric arc furnaces with scrap steel',
          'Implement direct reduced iron (DRI) processes',
          'Develop hydrogen-based steel production',
          'Increase scrap collection and sorting'
        ]
      },
      aluminum: {
        title: 'Aluminum Industry Best Practices',
        description: 'Focus on closed-loop recycling and energy-efficient smelting.',
        actions: [
          'Implement closed-loop recycling systems',
          'Use renewable energy for smelting',
          'Develop aluminum recovery from end-of-life products',
          'Optimize casting and forming processes'
        ]
      },
      copper: {
        title: 'Copper Industry Best Practices',
        description: 'Improve copper recovery and reduce environmental impact.',
        actions: [
          'Implement advanced copper recovery technologies',
          'Use bioleaching for low-grade ores',
          'Develop copper recycling from electronics',
          'Optimize smelting and refining processes'
        ]
      }
    };

    const industryRec = industryRecommendations[processes[0]?.industry];
    if (industryRec) {
      recommendations.push({
        type: 'medium',
        category: 'industry',
        title: industryRec.title,
        description: industryRec.description,
        impact: 'Industry-specific improvements',
        icon: CheckCircle,
        actions: industryRec.actions
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (type) => {
    switch (type) {
      case 'high':
        return 'border-error-200 bg-error-50';
      case 'medium':
        return 'border-warning-200 bg-warning-50';
      case 'low':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (type) => {
    switch (type) {
      case 'high':
        return 'text-error-600';
      case 'medium':
        return 'text-warning-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Excellent Performance!</h3>
          <p className="text-gray-500">
            Your project is performing well. Continue monitoring and look for opportunities to further improve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Lightbulb className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div key={index} className={`border rounded-lg p-6 ${getPriorityColor(rec.type)}`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getPriorityColor(rec.type)}`}>
                    <Icon className={`w-6 h-6 ${getPriorityIcon(rec.type)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{rec.title}</h4>
                      <span className={`badge ${
                        rec.type === 'high' ? 'badge-error' :
                        rec.type === 'medium' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {rec.type.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Expected Impact:</span>
                      <p className="text-sm text-gray-600">{rec.impact}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Recommended Actions:</span>
                      <ul className="space-y-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                            <ArrowRight className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
