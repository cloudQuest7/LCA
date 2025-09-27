const express = require('express');
const axios = require('axios');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Run ML analysis on project
router.post('/:id/run', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.processes.length === 0) {
      return res.status(400).json({ error: 'No processes found in project' });
    }

    // Prepare data for ML service
    const mlData = {
      projectId: project._id,
      industry: project.industry,
      processes: project.processes.map(process => ({
        name: process.name,
        type: process.type,
        rawMaterials: process.rawMaterials || [],
        energy: process.energy || {},
        impacts: process.impacts || {},
        circularity: process.circularity || {},
        transport: process.transport || {},
        endOfLife: process.endOfLife || {},
        dataQuality: process.dataQuality || 'medium'
      }))
    };

    // Call ML service
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/api/analyze`,
      mlData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ML_SERVICE_API_KEY || 'default-key'}`
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    // Update project with ML predictions
    if (mlResponse.data.predictions) {
      project.processes.forEach((process, index) => {
        if (mlResponse.data.predictions[index]) {
          process.predictions = mlResponse.data.predictions[index];
        }
      });
    }

    // Update overall analysis
    if (mlResponse.data.overallAnalysis) {
      project.analysis = {
        ...project.analysis,
        ...mlResponse.data.overallAnalysis,
        lastAnalyzed: new Date()
      };
    }

    // Recalculate overall metrics
    project.calculateOverallMetrics();
    await project.save();

    res.json({
      message: 'Analysis completed successfully',
      analysis: project.analysis,
      predictions: project.processes.map(p => p.predictions)
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML service is unavailable. Please try again later.' 
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: error.response.data?.error || 'ML service error' 
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analysis results
router.get('/:id/results', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    }).select('analysis processes');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.analysis || !project.analysis.lastAnalyzed) {
      return res.status(400).json({ error: 'No analysis results found. Please run analysis first.' });
    }

    // Prepare detailed results
    const results = {
      overall: project.analysis,
      processes: project.processes.map(process => ({
        name: process.name,
        type: process.type,
        predictions: process.predictions,
        circularity: process.circularity,
        impacts: process.impacts
      })),
      summary: {
        totalProcesses: project.processes.length,
        circularProcesses: project.processes.filter(p => 
          p.predictions?.pathwayClassification === 'circular'
        ).length,
        linearProcesses: project.processes.filter(p => 
          p.predictions?.pathwayClassification === 'linear'
        ).length,
        averageConfidence: project.processes.reduce((sum, p) => 
          sum + (p.predictions?.confidence || 0), 0) / project.processes.length
      }
    };

    res.json({ results });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get circularity analysis
router.get('/:id/circularity', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    }).select('processes analysis');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate circularity metrics
    const circularityAnalysis = {
      overallScore: project.analysis?.circularityScore || 0,
      processes: project.processes.map(process => ({
        name: process.name,
        type: process.type,
        circularity: process.circularity,
        pathway: process.predictions?.pathwayClassification,
        confidence: process.predictions?.confidence,
        recommendations: generateCircularityRecommendations(process)
      })),
      opportunities: identifyCircularityOpportunities(project.processes),
      benchmarks: {
        industry: getIndustryBenchmarks(project.industry),
        bestPractice: getBestPracticeBenchmarks()
      }
    };

    res.json({ circularityAnalysis });
  } catch (error) {
    console.error('Circularity analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Compare projects
router.post('/compare', auth, async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!Array.isArray(projectIds) || projectIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 project IDs required for comparison' });
    }

    const projects = await Project.find({
      _id: { $in: projectIds },
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    }).select('name industry analysis processes');

    if (projects.length !== projectIds.length) {
      return res.status(404).json({ error: 'One or more projects not found' });
    }

    const comparison = {
      projects: projects.map(project => ({
        id: project._id,
        name: project.name,
        industry: project.industry,
        metrics: {
          totalCO2: project.analysis?.totalCO2 || 0,
          totalEnergy: project.analysis?.totalEnergy || 0,
          recyclingRate: project.analysis?.overallRecyclingRate || 0,
          circularityScore: project.analysis?.circularityScore || 0,
          sustainabilityRating: project.analysis?.sustainabilityRating || 'F'
        }
      })),
      summary: {
        bestPerformer: projects.reduce((best, current) => 
          (current.analysis?.circularityScore || 0) > (best.analysis?.circularityScore || 0) ? current : best
        ),
        averageMetrics: calculateAverageMetrics(projects)
      }
    };

    res.json({ comparison });
  } catch (error) {
    console.error('Compare projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function generateCircularityRecommendations(process) {
  const recommendations = [];
  
  if (process.circularity?.recyclability < 50) {
    recommendations.push('Improve recyclability through better material selection');
  }
  
  if (process.circularity?.reusability < 30) {
    recommendations.push('Design for reusability and modularity');
  }
  
  if (process.endOfLife?.recycling?.percentage < 70) {
    recommendations.push('Increase end-of-life recycling rates');
  }
  
  if (process.rawMaterials?.some(m => m.source === 'virgin' && m.recycledContent < 20)) {
    recommendations.push('Increase use of recycled materials');
  }
  
  return recommendations;
}

function identifyCircularityOpportunities(processes) {
  const opportunities = [];
  
  // Check for linear processes that could be made circular
  const linearProcesses = processes.filter(p => 
    p.predictions?.pathwayClassification === 'linear'
  );
  
  if (linearProcesses.length > 0) {
    opportunities.push({
      type: 'pathway_transformation',
      description: `${linearProcesses.length} processes identified as linear - potential for circular transformation`,
      impact: 'high'
    });
  }
  
  // Check for low recycling rates
  const lowRecyclingProcesses = processes.filter(p => 
    p.endOfLife?.recycling?.percentage < 50
  );
  
  if (lowRecyclingProcesses.length > 0) {
    opportunities.push({
      type: 'recycling_improvement',
      description: `${lowRecyclingProcesses.length} processes with low recycling rates`,
      impact: 'medium'
    });
  }
  
  return opportunities;
}

function getIndustryBenchmarks(industry) {
  const benchmarks = {
    steel: { circularityScore: 65, recyclingRate: 85, co2Intensity: 1.8 },
    aluminum: { circularityScore: 70, recyclingRate: 90, co2Intensity: 0.5 },
    copper: { circularityScore: 60, recyclingRate: 80, co2Intensity: 2.1 },
    gold: { circularityScore: 40, recyclingRate: 60, co2Intensity: 15.0 },
    iron_ore: { circularityScore: 55, recyclingRate: 75, co2Intensity: 2.5 }
  };
  
  return benchmarks[industry] || benchmarks.steel;
}

function getBestPracticeBenchmarks() {
  return {
    circularityScore: 85,
    recyclingRate: 95,
    co2Intensity: 0.8
  };
}

function calculateAverageMetrics(projects) {
  const totals = projects.reduce((acc, project) => {
    const analysis = project.analysis || {};
    return {
      totalCO2: acc.totalCO2 + (analysis.totalCO2 || 0),
      totalEnergy: acc.totalEnergy + (analysis.totalEnergy || 0),
      recyclingRate: acc.recyclingRate + (analysis.overallRecyclingRate || 0),
      circularityScore: acc.circularityScore + (analysis.circularityScore || 0)
    };
  }, { totalCO2: 0, totalEnergy: 0, recyclingRate: 0, circularityScore: 0 });
  
  const count = projects.length;
  return {
    totalCO2: totals.totalCO2 / count,
    totalEnergy: totals.totalEnergy / count,
    recyclingRate: totals.recyclingRate / count,
    circularityScore: totals.circularityScore / count
  };
}

module.exports = router;

