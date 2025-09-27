const express = require('express');
const Joi = require('joi');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const projectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  industry: Joi.string().valid('steel', 'aluminum', 'copper', 'gold', 'iron_ore', 'other').required(),
  product: Joi.string().required(),
  functionalUnit: Joi.string().required()
});

const processSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('mining', 'processing', 'transport', 'manufacturing', 'end_of_life').required(),
  rawMaterials: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    amount: Joi.number().required(),
    unit: Joi.string().required(),
    source: Joi.string().valid('virgin', 'recycled', 'mixed').optional(),
    recycledContent: Joi.number().min(0).max(100).optional()
  })).optional(),
  energy: Joi.object({
    electricity: Joi.object({
      amount: Joi.number().optional(),
      unit: Joi.string().optional(),
      source: Joi.string().optional()
    }).optional(),
    fuel: Joi.object({
      amount: Joi.number().optional(),
      unit: Joi.string().optional(),
      type: Joi.string().optional()
    }).optional()
  }).optional(),
  impacts: Joi.object({
    co2Emissions: Joi.object({
      amount: Joi.number().optional(),
      unit: Joi.string().optional(),
      scope: Joi.string().valid('scope1', 'scope2', 'scope3').optional()
    }).optional(),
    waterUse: Joi.object({
      amount: Joi.number().optional(),
      unit: Joi.string().optional()
    }).optional(),
    waste: Joi.object({
      amount: Joi.number().optional(),
      unit: Joi.string().optional(),
      type: Joi.string().optional()
    }).optional()
  }).optional(),
  circularity: Joi.object({
    recyclability: Joi.number().min(0).max(100).optional(),
    reusability: Joi.number().min(0).max(100).optional(),
    durability: Joi.number().optional(),
    repairability: Joi.number().min(0).max(100).optional()
  }).optional(),
  transport: Joi.object({
    distance: Joi.number().optional(),
    unit: Joi.string().optional(),
    mode: Joi.string().valid('truck', 'ship', 'rail', 'air', 'pipeline').optional(),
    fuelType: Joi.string().optional()
  }).optional(),
  endOfLife: Joi.object({
    recycling: Joi.object({
      percentage: Joi.number().min(0).max(100).optional(),
      method: Joi.string().optional()
    }).optional(),
    landfilling: Joi.object({
      percentage: Joi.number().min(0).max(100).optional()
    }).optional(),
    incineration: Joi.object({
      percentage: Joi.number().min(0).max(100).optional(),
      energyRecovery: Joi.boolean().optional()
    }).optional(),
    reuse: Joi.object({
      percentage: Joi.number().min(0).max(100).optional(),
      application: Joi.string().optional()
    }).optional()
  }).optional(),
  dataQuality: Joi.string().valid('high', 'medium', 'low').optional(),
  source: Joi.string().optional(),
  notes: Joi.string().optional()
});

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, industry } = req.query;
    const query = { 
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    };

    if (status) query.status = status;
    if (industry) query.industry = industry;

    const projects = await Project.find(query)
      .populate('owner', 'username email profile')
      .populate('collaborators.user', 'username email profile')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId }
      ]
    })
    .populate('owner', 'username email profile')
    .populate('collaborators.user', 'username email profile');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const project = new Project({
      ...value,
      owner: req.user.userId
    });

    await project.save();
    await project.populate('owner', 'username email profile');

    res.status(201).json({ 
      message: 'Project created successfully',
      project 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    Object.assign(project, value);
    await project.save();
    await project.populate('owner', 'username email profile');

    res.json({ 
      message: 'Project updated successfully',
      project 
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add process to project
router.post('/:id/processes', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    const { error, value } = processSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    project.processes.push(value);
    project.calculateOverallMetrics();
    await project.save();

    res.json({ 
      message: 'Process added successfully',
      project 
    });
  } catch (error) {
    console.error('Add process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update process
router.put('/:id/processes/:processId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    const process = project.processes.id(req.params.processId);
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }

    const { error, value } = processSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    Object.assign(process, value);
    project.calculateOverallMetrics();
    await project.save();

    res.json({ 
      message: 'Process updated successfully',
      project 
    });
  } catch (error) {
    console.error('Update process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete process
router.delete('/:id/processes/:processId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'collaborators.user': req.user.userId, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    const process = project.processes.id(req.params.processId);
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }

    process.remove();
    project.calculateOverallMetrics();
    await project.save();

    res.json({ 
      message: 'Process deleted successfully',
      project 
    });
  } catch (error) {
    console.error('Delete process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

