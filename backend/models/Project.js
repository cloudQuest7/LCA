const mongoose = require('mongoose');

const processDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mining', 'processing', 'transport', 'manufacturing', 'end_of_life'],
    required: true
  },
  // Raw material inputs
  rawMaterials: [{
    name: String,
    amount: Number,
    unit: String,
    source: {
      type: String,
      enum: ['virgin', 'recycled', 'mixed']
    },
    recycledContent: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  // Energy consumption
  energy: {
    electricity: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'kWh' },
      source: { type: String, default: 'grid' } // e.g., 'grid', 'renewable', 'coal'
    },
    fuel: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'L' },
      type: { type: String, default: 'diesel' } // e.g., 'diesel', 'natural_gas'
    }
  },
  // Environmental impacts
  impacts: {
    co2Emissions: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'kg CO2 eq' },
      scope: {
        type: String,
        enum: ['scope1', 'scope2', 'scope3'],
        default: 'scope1'
      }
    },
    waterUse: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'L' }
    },
    waste: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: 'kg' },
      type: { type: String, default: 'general' }
    }
  },
  // Circular economy indicators
  circularity: {
    recyclability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    reusability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    durability: {
      type: Number,
      default: 0
    },
    repairability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  // Transport data
  transport: {
    distance: { type: Number, default: 0 },
    unit: { type: String, default: 'km' },
    mode: {
      type: String,
      enum: ['truck', 'ship', 'rail', 'air', 'pipeline'],
      default: 'truck'
    },
    fuelType: { type: String, default: 'diesel' }
  },
  // End of life options
  endOfLife: {
    recycling: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      method: { type: String, default: 'mechanical' }
    },
    landfilling: {
      percentage: { type: Number, min: 0, max: 100, default: 0 }
    },
    incineration: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      energyRecovery: { type: Boolean, default: false }
    },
    reuse: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      application: { type: String, default: 'general' }
    }
  },
  // ML predictions (filled by ML service)
  predictions: {
    predictedCO2: Number,
    predictedEnergy: Number,
    predictedRecyclingRate: Number,
    pathwayClassification: {
      type: String,
      enum: ['linear', 'circular', 'hybrid']
    },
    confidence: Number
  },
  // Metadata
  dataQuality: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  source: String,
  notes: String
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin']
    }
  }],
  // Project metadata
  industry: {
    type: String,
    enum: ['steel', 'aluminum', 'copper', 'gold', 'iron_ore', 'other'],
    required: true
  },
  product: {
    type: String,
    required: true
  },
  functionalUnit: {
    type: String,
    required: true // e.g., '1 kg of steel', '1 m2 of aluminum sheet'
  },
  // Process data
  processes: [processDataSchema],
  // Analysis results
  analysis: {
    totalCO2: Number,
    totalEnergy: Number,
    overallRecyclingRate: Number,
    circularityScore: Number,
    linearityScore: Number,
    sustainabilityRating: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F']
    },
    recommendations: [String],
    lastAnalyzed: Date
  },
  // Project status
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'archived'],
    default: 'draft'
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Update timestamp on save
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate overall metrics
projectSchema.methods.calculateOverallMetrics = function() {
  const processes = this.processes;
  
  let totalCO2 = 0;
  let totalEnergy = 0;
  let totalRecycledContent = 0;
  let processCount = 0;
  
  processes.forEach(process => {
    if (process.impacts?.co2Emissions?.amount) {
      totalCO2 += process.impacts.co2Emissions.amount;
    }
    if (process.energy?.electricity?.amount) {
      totalEnergy += process.energy.electricity.amount;
    }
    if (process.rawMaterials?.length > 0) {
      const avgRecycled = process.rawMaterials.reduce((sum, material) => 
        sum + (material.recycledContent || 0), 0) / process.rawMaterials.length;
      totalRecycledContent += avgRecycled;
      processCount++;
    }
  });
  
  this.analysis = {
    ...this.analysis,
    totalCO2,
    totalEnergy,
    overallRecyclingRate: processCount > 0 ? totalRecycledContent / processCount : 0,
    lastAnalyzed: new Date()
  };
};

module.exports = mongoose.model('Project', projectSchema);

