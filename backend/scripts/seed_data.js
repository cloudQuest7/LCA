const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Project = require('../models/Project');
const { sampleUsers, sampleProjects, sampleReports } = require('../data/sample_data');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lca-tool');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Create projects
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i];
      const project = new Project({
        ...projectData,
        owner: users[0]._id, // Assign to first user
        reports: i === 0 ? sampleReports : [] // Add sample report to first project
      });
      
      // Calculate overall metrics
      project.calculateOverallMetrics();
      await project.save();
      console.log(`📁 Created project: ${project.name}`);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${users.length} users and ${sampleProjects.length} projects`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
