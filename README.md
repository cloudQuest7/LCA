# AI-Powered Life Cycle Assessment (LCA) Tool

A comprehensive web platform for conducting Life Cycle Assessments in the metallurgy and mining sector, powered by AI and machine learning.

## 🎯 Features

- **Process Input Management**: Input or select process details (raw vs recycled routes, energy use, transport, end-of-life options)
- **ML-Powered Predictions**: 
  - Fill missing parameters (predict CO₂, energy use, recycling %)
  - Classify processes into linear vs circular pathways
  - Estimate sustainability indicators
- **Data Visualization**: Charts, circular flow diagrams, and comparisons
- **AI-Generated Reports**: Automated sustainability reports and recommendations

## 🏗️ Architecture

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **ML Service**: Python + FastAPI
- **AI Integration**: LLM API for report generation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-lca-tool
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Copy example env files
cp backend/env.example backend/.env
cp ml-service/env.example ml-service/.env
```

4. Configure environment variables:
```bash
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lca-tool
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=your-openai-api-key-here
ML_SERVICE_URL=http://localhost:8001
NODE_ENV=development

# ML Service (.env)
ML_SERVICE_API_KEY=your-ml-service-api-key-here
MODEL_PATH=./models
LOG_LEVEL=INFO
```

5. Seed the database with sample data:
```bash
cd backend
npm run seed
```

6. Start all services:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- ML Service: http://localhost:8001

## 📁 Project Structure

```
ai-lca-tool/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.js
│   ├── public/
│   └── package.json
├── backend/               # Node.js/Express backend API
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic services
│   ├── data/             # Sample data
│   ├── scripts/          # Database scripts
│   └── server.js
├── ml-service/           # Python ML service
│   ├── models/           # ML model implementations
│   ├── utils/            # Utility functions
│   ├── main.py           # FastAPI application
│   └── requirements.txt
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lca-tool
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=your-openai-api-key-here
ML_SERVICE_URL=http://localhost:8001
NODE_ENV=development
```

### ML Service Environment Variables
```env
ML_SERVICE_API_KEY=your-ml-service-api-key-here
MODEL_PATH=./models
LOG_LEVEL=INFO
```

## 📊 Usage

### 1. User Registration & Login
- Register a new account or use sample credentials:
  - Email: `john@example.com`, Password: `password123`
  - Email: `sarah@example.com`, Password: `password123`

### 2. Create a Project
- Click "New Project" on the dashboard
- Fill in project details (name, industry, product, functional unit)
- Save the project

### 3. Add Processes
- Open your project
- Click "Add Process" to add manufacturing processes
- Fill in process data:
  - Raw materials and their sources
  - Energy consumption
  - Environmental impacts
  - Circularity indicators
  - Transport and end-of-life data

### 4. Run Analysis
- Click "Run Analysis" to trigger ML predictions
- View results including:
  - Predicted CO₂ emissions
  - Energy consumption estimates
  - Recycling rate predictions
  - Pathway classification (linear vs circular)
  - Circularity scores

### 5. View Results
- Explore interactive visualizations
- Review process-by-process analysis
- Check circularity charts and metrics
- Read AI-generated recommendations

### 6. Generate Reports
- Click "Generate Report" to create AI-powered sustainability reports
- Download reports in JSON format
- Share insights with stakeholders

## 🤖 ML Models

### Regression Models
- **CO₂ Predictor**: Predicts CO₂ emissions based on process parameters
- **Energy Predictor**: Estimates energy consumption
- **Recycling Rate Predictor**: Predicts material recycling rates
- **Circularity Score Predictor**: Calculates overall circularity scores

### Classification Models
- **Pathway Classifier**: Classifies processes as linear, circular, or hybrid
- **Sustainability Rating Classifier**: Rates processes A-F based on environmental performance
- **Process Type Classifier**: Identifies process types (mining, processing, etc.)

### Forecasting Models
- **Lifetime Predictor**: Predicts product lifetime
- **Circularity Predictor**: Forecasts circularity potential
- **Recycling Potential Predictor**: Estimates recycling opportunities

## 🔬 Sample Data

The application includes comprehensive sample data:
- 2 sample users with different roles
- 3 sample projects across different industries (steel, aluminum, copper)
- Multiple processes per project with realistic data
- Pre-calculated analysis results
- Sample AI-generated reports

## 🛠️ Development

### Running Individual Services

**Backend only:**
```bash
cd backend
npm install
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm install
npm start
```

**ML Service only:**
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

### Database Management

**Seed sample data:**
```bash
cd backend
npm run seed
```

**Clear database:**
```bash
# Connect to MongoDB and drop the database
mongo
use lca-tool
db.dropDatabase()
```

## 🔮 Next Steps

### Immediate Improvements
- [ ] Add real metallurgy datasets for model training
- [ ] Implement PDF report generation
- [ ] Add data import/export functionality
- [ ] Create user role management
- [ ] Add project collaboration features

### Advanced Features
- [ ] Real-time data integration
- [ ] Advanced visualizations (Sankey diagrams, 3D charts)
- [ ] Mobile-responsive design improvements
- [ ] API rate limiting and caching
- [ ] Integration with external LCA databases

### Model Enhancements
- [ ] Fine-tune models with industry-specific data
- [ ] Implement deep learning models
- [ ] Add uncertainty quantification
- [ ] Create model versioning system
- [ ] Add model performance monitoring

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env` file

**ML Service Not Responding:**
- Verify Python dependencies: `pip install -r requirements.txt`
- Check ML service logs for errors
- Ensure port 8001 is available

**Frontend Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**Authentication Issues:**
- Verify JWT_SECRET is set in backend `.env`
- Check token expiration settings

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation in `/docs`

