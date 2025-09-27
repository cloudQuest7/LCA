const express = require('express');
const axios = require('axios');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate AI-powered sustainability report
router.post('/:id/generate', auth, async (req, res) => {
  try {
    const { format = 'json', includeRecommendations = true } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    }).populate('owner', 'username email profile');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.analysis || !project.analysis.lastAnalyzed) {
      return res.status(400).json({ error: 'No analysis results found. Please run analysis first.' });
    }

    // Prepare data for AI report generation
    const reportData = {
      project: {
        name: project.name,
        description: project.description,
        industry: project.industry,
        product: project.product,
        functionalUnit: project.functionalUnit,
        owner: project.owner
      },
      analysis: project.analysis,
      processes: project.processes.map(process => ({
        name: process.name,
        type: process.type,
        impacts: process.impacts,
        circularity: process.circularity,
        predictions: process.predictions,
        endOfLife: process.endOfLife
      })),
      includeRecommendations
    };

    // Call AI service for report generation
    const aiService = require('../services/aiService');
    const aiReport = await aiService.generateSustainabilityReport(
      reportData.project,
      reportData.analysis
    );

    // Structure the report
    const report = {
      id: `report_${Date.now()}`,
      projectId: project._id,
      projectName: project.name,
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI Sustainability Consultant',
      format,
      content: {
        executiveSummary: generateExecutiveSummary(project),
        keyFindings: generateKeyFindings(project),
        environmentalImpacts: generateEnvironmentalImpacts(project),
        circularityAssessment: generateCircularityAssessment(project),
        recommendations: includeRecommendations ? generateRecommendations(project) : [],
        aiInsights: aiReport,
        dataQuality: assessDataQuality(project),
        methodology: getMethodologyNotes()
      },
      metadata: {
        totalProcesses: project.processes.length,
        analysisDate: project.analysis.lastAnalyzed,
        confidence: calculateOverallConfidence(project)
      }
    };

    // Save report to project
    if (!project.reports) {
      project.reports = [];
    }
    project.reports.push(report);
    await project.save();

    res.json({
      message: 'Report generated successfully',
      report,
      downloadUrl: `/api/reports/${project._id}/download/${report.id}`
    });

  } catch (error) {
    console.error('Report generation error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'AI service authentication failed' });
    }
    
    if (error.response?.status === 429) {
      return res.status(503).json({ error: 'AI service rate limit exceeded. Please try again later.' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get generated reports for project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    }).select('reports name');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      projectName: project.name,
      reports: project.reports || []
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download report
router.get('/:id/download/:reportId', auth, async (req, res) => {
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

    const report = project.reports?.find(r => r.id === req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Set appropriate headers based on format
    const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_sustainability_report_${report.generatedAt.split('T')[0]}`;
    
    if (report.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    } else if (report.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    }

    res.json(report);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export project data
router.get('/:id/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

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

    const exportData = {
      project: {
        name: project.name,
        description: project.description,
        industry: project.industry,
        product: project.product,
        functionalUnit: project.functionalUnit,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      processes: project.processes,
      analysis: project.analysis,
      reports: project.reports || []
    };

    const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_export_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(convertToCSV(exportData));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(exportData);
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function generateExecutiveSummary(project) {
  const analysis = project.analysis || {};
  const totalProcesses = project.processes.length;
  const circularProcesses = project.processes.filter(p => 
    p.predictions?.pathwayClassification === 'circular'
  ).length;

  return {
    overview: `This LCA analysis covers ${totalProcesses} processes in the ${project.industry} industry for ${project.product}.`,
    keyMetrics: {
      totalCO2Emissions: analysis.totalCO2 || 0,
      totalEnergyConsumption: analysis.totalEnergy || 0,
      overallRecyclingRate: analysis.overallRecyclingRate || 0,
      circularityScore: analysis.circularityScore || 0
    },
    circularityStatus: `${circularProcesses}/${totalProcesses} processes classified as circular`,
    sustainabilityRating: analysis.sustainabilityRating || 'F'
  };
}

function generateKeyFindings(project) {
  const findings = [];
  const analysis = project.analysis || {};

  if (analysis.totalCO2 > 0) {
    findings.push(`Total CO₂ emissions: ${analysis.totalCO2.toFixed(2)} kg CO₂ eq per ${project.functionalUnit}`);
  }

  if (analysis.overallRecyclingRate > 0) {
    findings.push(`Overall recycling rate: ${(analysis.overallRecyclingRate * 100).toFixed(1)}%`);
  }

  if (analysis.circularityScore > 0) {
    findings.push(`Circularity score: ${analysis.circularityScore.toFixed(1)}/100`);
  }

  const linearProcesses = project.processes.filter(p => 
    p.predictions?.pathwayClassification === 'linear'
  ).length;

  if (linearProcesses > 0) {
    findings.push(`${linearProcesses} processes identified as linear - opportunities for circular transformation`);
  }

  return findings;
}

function generateEnvironmentalImpacts(project) {
  const analysis = project.analysis || {};
  
  return {
    climateChange: {
      totalCO2: analysis.totalCO2 || 0,
      unit: 'kg CO₂ eq',
      scope: 'Cradle-to-gate'
    },
    energyConsumption: {
      total: analysis.totalEnergy || 0,
      unit: 'kWh',
      renewablePercentage: calculateRenewablePercentage(project.processes)
    },
    resourceEfficiency: {
      recyclingRate: analysis.overallRecyclingRate || 0,
      wasteGeneration: calculateWasteGeneration(project.processes)
    }
  };
}

function generateCircularityAssessment(project) {
  const circularProcesses = project.processes.filter(p => 
    p.predictions?.pathwayClassification === 'circular'
  ).length;
  const totalProcesses = project.processes.length;

  return {
    overallScore: project.analysis?.circularityScore || 0,
    circularProcesses: circularProcesses,
    totalProcesses: totalProcesses,
    circularityPercentage: totalProcesses > 0 ? (circularProcesses / totalProcesses) * 100 : 0,
    opportunities: identifyCircularityOpportunities(project.processes)
  };
}

function generateRecommendations(project) {
  const recommendations = [];
  const analysis = project.analysis || {};

  if (analysis.circularityScore < 50) {
    recommendations.push({
      priority: 'high',
      category: 'circularity',
      title: 'Improve Circularity Score',
      description: 'Focus on increasing material recycling and designing for reusability',
      impact: 'Reduce environmental impact by 20-30%'
    });
  }

  if (analysis.overallRecyclingRate < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'recycling',
      title: 'Increase Recycling Rates',
      description: 'Implement better end-of-life management and material recovery systems',
      impact: 'Improve resource efficiency and reduce waste'
    });
  }

  const lowConfidenceProcesses = project.processes.filter(p => 
    p.predictions?.confidence < 0.7
  ).length;

  if (lowConfidenceProcesses > 0) {
    recommendations.push({
      priority: 'low',
      category: 'data_quality',
      title: 'Improve Data Quality',
      description: `${lowConfidenceProcesses} processes have low prediction confidence - collect more accurate data`,
      impact: 'Improve analysis accuracy and reliability'
    });
  }

  return recommendations;
}

function assessDataQuality(project) {
  const processes = project.processes;
  const highQuality = processes.filter(p => p.dataQuality === 'high').length;
  const mediumQuality = processes.filter(p => p.dataQuality === 'medium').length;
  const lowQuality = processes.filter(p => p.dataQuality === 'low').length;

  return {
    overall: highQuality > mediumQuality && highQuality > lowQuality ? 'high' : 
             mediumQuality > lowQuality ? 'medium' : 'low',
    breakdown: { highQuality, mediumQuality, lowQuality },
    totalProcesses: processes.length
  };
}

function getMethodologyNotes() {
  return {
    standard: 'ISO 14040/14044 LCA methodology',
    systemBoundary: 'Cradle-to-gate with end-of-life considerations',
    dataSources: 'Industry databases, literature, and ML predictions',
    uncertainty: 'ML predictions include confidence scores',
    assumptions: 'Standard LCA assumptions applied'
  };
}

function calculateOverallConfidence(project) {
  const processes = project.processes;
  if (processes.length === 0) return 0;
  
  const totalConfidence = processes.reduce((sum, p) => 
    sum + (p.predictions?.confidence || 0), 0);
  
  return totalConfidence / processes.length;
}

function calculateRenewablePercentage(processes) {
  // Simplified calculation - in real implementation, this would be more sophisticated
  return 25; // Placeholder
}

function calculateWasteGeneration(processes) {
  return processes.reduce((total, process) => {
    return total + (process.impacts?.waste?.amount || 0);
  }, 0);
}

function identifyCircularityOpportunities(processes) {
  const opportunities = [];
  
  const linearProcesses = processes.filter(p => 
    p.predictions?.pathwayClassification === 'linear'
  );
  
  if (linearProcesses.length > 0) {
    opportunities.push('Transform linear processes to circular');
  }
  
  const lowRecyclingProcesses = processes.filter(p => 
    p.endOfLife?.recycling?.percentage < 50
  );
  
  if (lowRecyclingProcesses.length > 0) {
    opportunities.push('Improve end-of-life recycling rates');
  }
  
  return opportunities;
}

function convertToCSV(data) {
  // Simplified CSV conversion - in production, use a proper CSV library
  return JSON.stringify(data, null, 2);
}

module.exports = router;

