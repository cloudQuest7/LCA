// Sample data for testing the AI LCA Tool

const sampleUsers = [
  {
    username: 'john_metallurgist',
    email: 'john@example.com',
    password: 'password123',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      organization: 'SteelCorp Industries',
      department: 'Sustainability',
      expertise: ['Metallurgy', 'Sustainability', 'Life Cycle Assessment']
    },
    role: 'analyst'
  },
  {
    username: 'sarah_engineer',
    email: 'sarah@example.com',
    password: 'password123',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      organization: 'Aluminum Solutions Ltd',
      department: 'Process Engineering',
      expertise: ['Process Engineering', 'Circular Economy', 'Materials Science']
    },
    role: 'user'
  }
];

const sampleProjects = [
  {
    name: 'Steel Beam Production LCA',
    description: 'Comprehensive LCA analysis for steel beam production including raw material extraction, processing, and end-of-life scenarios.',
    industry: 'steel',
    product: 'Steel I-beam',
    functionalUnit: '1 kg of steel beam',
    status: 'completed',
    processes: [
      {
        name: 'Iron Ore Mining',
        type: 'mining',
        rawMaterials: [
          { name: 'Iron ore', amount: 1.5, unit: 'kg', source: 'virgin', recycledContent: 0 },
          { name: 'Limestone', amount: 0.3, unit: 'kg', source: 'virgin', recycledContent: 0 }
        ],
        energy: {
          electricity: { amount: 50, unit: 'kWh', source: 'grid' },
          fuel: { amount: 20, unit: 'L', type: 'diesel' }
        },
        impacts: {
          co2Emissions: { amount: 120, unit: 'kg CO2 eq', scope: 'scope1' },
          waterUse: { amount: 200, unit: 'L' },
          waste: { amount: 0.1, unit: 'kg', type: 'mining waste' }
        },
        circularity: {
          recyclability: 85,
          reusability: 20,
          durability: 50,
          repairability: 30
        },
        transport: {
          distance: 100,
          unit: 'km',
          mode: 'truck',
          fuelType: 'diesel'
        },
        endOfLife: {
          recycling: { percentage: 90, method: 'electric arc furnace' },
          landfilling: { percentage: 5 },
          incineration: { percentage: 5, energyRecovery: true }
        },
        dataQuality: 'high',
        source: 'Industry database',
        notes: 'High-quality data from verified sources'
      },
      {
        name: 'Steel Processing',
        type: 'processing',
        rawMaterials: [
          { name: 'Iron ore', amount: 1.2, unit: 'kg', source: 'virgin', recycledContent: 0 },
          { name: 'Scrap steel', amount: 0.3, unit: 'kg', source: 'recycled', recycledContent: 100 }
        ],
        energy: {
          electricity: { amount: 200, unit: 'kWh', source: 'grid' },
          fuel: { amount: 50, unit: 'L', type: 'natural_gas' }
        },
        impacts: {
          co2Emissions: { amount: 180, unit: 'kg CO2 eq', scope: 'scope2' },
          waterUse: { amount: 500, unit: 'L' },
          waste: { amount: 0.05, unit: 'kg', type: 'slag' }
        },
        circularity: {
          recyclability: 95,
          reusability: 40,
          durability: 50,
          repairability: 60
        },
        dataQuality: 'high',
        source: 'Plant measurements',
        notes: 'Real-time data from production facility'
      },
      {
        name: 'Transport to Construction Site',
        type: 'transport',
        transport: {
          distance: 500,
          unit: 'km',
          mode: 'truck',
          fuelType: 'diesel'
        },
        impacts: {
          co2Emissions: { amount: 25, unit: 'kg CO2 eq', scope: 'scope3' }
        },
        circularity: {
          recyclability: 0,
          reusability: 0,
          durability: 0,
          repairability: 0
        },
        dataQuality: 'medium',
        source: 'Transport database',
        notes: 'Average transport distance for construction materials'
      }
    ],
    analysis: {
      totalCO2: 325,
      totalEnergy: 250,
      overallRecyclingRate: 45,
      circularityScore: 72,
      sustainabilityRating: 'B',
      lastAnalyzed: new Date('2024-01-15T10:30:00Z')
    }
  },
  {
    name: 'Aluminum Sheet Production',
    description: 'LCA analysis for aluminum sheet production focusing on circular economy principles and recycling potential.',
    industry: 'aluminum',
    product: 'Aluminum sheet',
    functionalUnit: '1 m² of aluminum sheet',
    status: 'in_progress',
    processes: [
      {
        name: 'Bauxite Mining',
        type: 'mining',
        rawMaterials: [
          { name: 'Bauxite ore', amount: 4.5, unit: 'kg', source: 'virgin', recycledContent: 0 }
        ],
        energy: {
          electricity: { amount: 30, unit: 'kWh', source: 'grid' },
          fuel: { amount: 15, unit: 'L', type: 'diesel' }
        },
        impacts: {
          co2Emissions: { amount: 80, unit: 'kg CO2 eq', scope: 'scope1' },
          waterUse: { amount: 150, unit: 'L' },
          waste: { amount: 2.0, unit: 'kg', type: 'red mud' }
        },
        circularity: {
          recyclability: 60,
          reusability: 10,
          durability: 30,
          repairability: 20
        },
        dataQuality: 'high',
        source: 'Mining company data',
        notes: 'Primary data from bauxite mining operations'
      },
      {
        name: 'Aluminum Smelting',
        type: 'processing',
        rawMaterials: [
          { name: 'Alumina', amount: 1.9, unit: 'kg', source: 'virgin', recycledContent: 0 },
          { name: 'Scrap aluminum', amount: 0.5, unit: 'kg', source: 'recycled', recycledContent: 100 }
        ],
        energy: {
          electricity: { amount: 150, unit: 'kWh', source: 'renewable' },
          fuel: { amount: 10, unit: 'L', type: 'natural_gas' }
        },
        impacts: {
          co2Emissions: { amount: 90, unit: 'kg CO2 eq', scope: 'scope2' },
          waterUse: { amount: 300, unit: 'L' },
          waste: { amount: 0.02, unit: 'kg', type: 'dross' }
        },
        circularity: {
          recyclability: 98,
          reusability: 70,
          durability: 30,
          repairability: 80
        },
        dataQuality: 'high',
        source: 'Smelter data',
        notes: 'Data from modern aluminum smelting facility'
      }
    ],
    analysis: {
      totalCO2: 170,
      totalEnergy: 180,
      overallRecyclingRate: 55,
      circularityScore: 65,
      sustainabilityRating: 'B',
      lastAnalyzed: new Date('2024-01-10T14:20:00Z')
    }
  },
  {
    name: 'Copper Wire Manufacturing',
    description: 'Life cycle assessment for copper wire production with focus on energy efficiency and recycling.',
    industry: 'copper',
    product: 'Copper wire',
    functionalUnit: '1 kg of copper wire',
    status: 'draft',
    processes: [
      {
        name: 'Copper Ore Mining',
        type: 'mining',
        rawMaterials: [
          { name: 'Copper ore', amount: 200, unit: 'kg', source: 'virgin', recycledContent: 0 }
        ],
        energy: {
          electricity: { amount: 100, unit: 'kWh', source: 'grid' },
          fuel: { amount: 40, unit: 'L', type: 'diesel' }
        },
        impacts: {
          co2Emissions: { amount: 150, unit: 'kg CO2 eq', scope: 'scope1' },
          waterUse: { amount: 1000, unit: 'L' },
          waste: { amount: 195, unit: 'kg', type: 'tailings' }
        },
        circularity: {
          recyclability: 75,
          reusability: 15,
          durability: 40,
          repairability: 25
        },
        dataQuality: 'medium',
        source: 'Industry average',
        notes: 'Based on typical copper mining operations'
      }
    ]
  }
];

const sampleReports = [
  {
    id: 'report_1705312200000',
    projectId: 'project1',
    projectName: 'Steel Beam Production LCA',
    generatedAt: '2024-01-15T10:30:00Z',
    generatedBy: 'AI Sustainability Consultant',
    format: 'json',
    content: {
      executiveSummary: {
        overview: 'This LCA analysis covers 3 processes in the steel industry for Steel I-beam. The analysis shows moderate environmental impact with good circularity potential.',
        keyMetrics: {
          totalCO2Emissions: 325,
          totalEnergyConsumption: 250,
          overallRecyclingRate: 45,
          circularityScore: 72
        },
        circularityStatus: '2/3 processes classified as circular',
        sustainabilityRating: 'B'
      },
      keyFindings: [
        'Total CO₂ emissions: 325.00 kg CO₂ eq per 1 kg of steel beam',
        'Overall recycling rate: 45.0%',
        'Circularity score: 72.0/100',
        '1 processes identified as linear - opportunities for circular transformation'
      ],
      recommendations: [
        {
          priority: 'high',
          category: 'circularity',
          title: 'Improve Circularity Score',
          description: 'Focus on increasing material recycling and designing for reusability',
          impact: 'Reduce environmental impact by 20-30%'
        },
        {
          priority: 'medium',
          category: 'recycling',
          title: 'Increase Recycling Rates',
          description: 'Implement better end-of-life management and material recovery systems',
          impact: 'Improve resource efficiency and reduce waste'
        }
      ]
    }
  }
];

module.exports = {
  sampleUsers,
  sampleProjects,
  sampleReports
};
