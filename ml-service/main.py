from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import logging

from models.regression_models import CO2Predictor, EnergyPredictor, RecyclingRatePredictor
from models.classification_models import PathwayClassifier
from models.forecasting_models import LifetimePredictor, CircularityPredictor
from utils.data_preprocessing import DataPreprocessor
from utils.feature_engineering import FeatureEngineer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI LCA ML Service",
    description="Machine Learning service for Life Cycle Assessment predictions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class ProcessData(BaseModel):
    name: str
    type: str
    rawMaterials: List[Dict[str, Any]] = []
    energy: Dict[str, Any] = {}
    impacts: Dict[str, Any] = {}
    circularity: Dict[str, Any] = {}
    transport: Dict[str, Any] = {}
    endOfLife: Dict[str, Any] = {}
    dataQuality: str = "medium"

class AnalysisRequest(BaseModel):
    projectId: str
    industry: str
    processes: List[ProcessData]

class PredictionResult(BaseModel):
    predictedCO2: Optional[float] = None
    predictedEnergy: Optional[float] = None
    predictedRecyclingRate: Optional[float] = None
    pathwayClassification: Optional[str] = None
    confidence: Optional[float] = None
    predictedLifetime: Optional[float] = None
    predictedCircularityScore: Optional[float] = None

class AnalysisResponse(BaseModel):
    projectId: str
    predictions: List[PredictionResult]
    overallAnalysis: Dict[str, Any]
    recommendations: List[str]
    confidence: float

# Initialize models
co2_predictor = CO2Predictor()
energy_predictor = EnergyPredictor()
recycling_predictor = RecyclingRatePredictor()
pathway_classifier = PathwayClassifier()
lifetime_predictor = LifetimePredictor()
circularity_predictor = CircularityPredictor()

# Initialize utilities
data_preprocessor = DataPreprocessor()
feature_engineer = FeatureEngineer()

# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    expected_token = os.getenv("ML_SERVICE_API_KEY", "default-key")
    
    if token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    return token

@app.get("/")
async def root():
    return {
        "message": "AI LCA ML Service",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "co2_predictor": co2_predictor.is_trained(),
            "energy_predictor": energy_predictor.is_trained(),
            "recycling_predictor": recycling_predictor.is_trained(),
            "pathway_classifier": pathway_classifier.is_trained(),
            "lifetime_predictor": lifetime_predictor.is_trained(),
            "circularity_predictor": circularity_predictor.is_trained()
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_project(
    request: AnalysisRequest,
    token: str = Depends(verify_token)
):
    """
    Analyze a project and generate ML predictions for all processes
    """
    try:
        logger.info(f"Analyzing project {request.projectId} with {len(request.processes)} processes")
        
        predictions = []
        all_features = []
        
        # Process each process in the project
        for process in request.processes:
            try:
                # Preprocess process data
                processed_data = data_preprocessor.preprocess_process(process.dict())
                
                # Generate features
                features = feature_engineer.extract_features(processed_data, request.industry)
                all_features.append(features)
                
                # Make predictions
                prediction = PredictionResult()
                
                # CO2 prediction
                if not process.impacts.get('co2Emissions', {}).get('amount'):
                    co2_pred = co2_predictor.predict(features)
                    prediction.predictedCO2 = float(co2_pred[0]) if co2_pred is not None else None
                
                # Energy prediction
                if not process.energy.get('electricity', {}).get('amount'):
                    energy_pred = energy_predictor.predict(features)
                    prediction.predictedEnergy = float(energy_pred[0]) if energy_pred is not None else None
                
                # Recycling rate prediction
                if not process.circularity.get('recyclability'):
                    recycling_pred = recycling_predictor.predict(features)
                    prediction.predictedRecyclingRate = float(recycling_pred[0]) if recycling_pred is not None else None
                
                # Pathway classification
                pathway_pred = pathway_classifier.predict(features)
                if pathway_pred is not None:
                    prediction.pathwayClassification = pathway_pred[0]
                    prediction.confidence = float(pathway_classifier.get_confidence(features))
                
                # Lifetime prediction
                lifetime_pred = lifetime_predictor.predict(features)
                prediction.predictedLifetime = float(lifetime_pred[0]) if lifetime_pred is not None else None
                
                # Circularity score prediction
                circularity_pred = circularity_predictor.predict(features)
                prediction.predictedCircularityScore = float(circularity_pred[0]) if circularity_pred is not None else None
                
                predictions.append(prediction)
                
            except Exception as e:
                logger.error(f"Error processing process {process.name}: {str(e)}")
                # Add empty prediction for failed processes
                predictions.append(PredictionResult())
        
        # Generate overall analysis
        overall_analysis = generate_overall_analysis(request, predictions)
        
        # Generate recommendations
        recommendations = generate_recommendations(request, predictions)
        
        # Calculate overall confidence
        overall_confidence = calculate_overall_confidence(predictions)
        
        response = AnalysisResponse(
            projectId=request.projectId,
            predictions=predictions,
            overallAnalysis=overall_analysis,
            recommendations=recommendations,
            confidence=overall_confidence
        )
        
        logger.info(f"Analysis completed for project {request.projectId}")
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing project {request.projectId}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/api/predict/co2")
async def predict_co2(
    features: Dict[str, Any],
    token: str = Depends(verify_token)
):
    """Predict CO2 emissions for a single process"""
    try:
        processed_features = data_preprocessor.preprocess_features(features)
        prediction = co2_predictor.predict(processed_features)
        
        return {
            "predictedCO2": float(prediction[0]) if prediction is not None else None,
            "confidence": float(co2_predictor.get_confidence(processed_features)) if prediction is not None else 0.0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CO2 prediction failed: {str(e)}"
        )

@app.post("/api/predict/energy")
async def predict_energy(
    features: Dict[str, Any],
    token: str = Depends(verify_token)
):
    """Predict energy consumption for a single process"""
    try:
        processed_features = data_preprocessor.preprocess_features(features)
        prediction = energy_predictor.predict(processed_features)
        
        return {
            "predictedEnergy": float(prediction[0]) if prediction is not None else None,
            "confidence": float(energy_predictor.get_confidence(processed_features)) if prediction is not None else 0.0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Energy prediction failed: {str(e)}"
        )

@app.post("/api/classify/pathway")
async def classify_pathway(
    features: Dict[str, Any],
    token: str = Depends(verify_token)
):
    """Classify process pathway (linear vs circular)"""
    try:
        processed_features = data_preprocessor.preprocess_features(features)
        prediction = pathway_classifier.predict(processed_features)
        confidence = pathway_classifier.get_confidence(processed_features)
        
        return {
            "pathwayClassification": prediction[0] if prediction is not None else None,
            "confidence": float(confidence) if confidence is not None else 0.0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pathway classification failed: {str(e)}"
        )

@app.get("/api/models/status")
async def get_models_status(token: str = Depends(verify_token)):
    """Get status of all ML models"""
    return {
        "models": {
            "co2_predictor": {
                "trained": co2_predictor.is_trained(),
                "model_type": "RandomForestRegressor",
                "features": co2_predictor.get_feature_names()
            },
            "energy_predictor": {
                "trained": energy_predictor.is_trained(),
                "model_type": "RandomForestRegressor",
                "features": energy_predictor.get_feature_names()
            },
            "recycling_predictor": {
                "trained": recycling_predictor.is_trained(),
                "model_type": "RandomForestRegressor",
                "features": recycling_predictor.get_feature_names()
            },
            "pathway_classifier": {
                "trained": pathway_classifier.is_trained(),
                "model_type": "RandomForestClassifier",
                "features": pathway_classifier.get_feature_names()
            },
            "lifetime_predictor": {
                "trained": lifetime_predictor.is_trained(),
                "model_type": "RandomForestRegressor",
                "features": lifetime_predictor.get_feature_names()
            },
            "circularity_predictor": {
                "trained": circularity_predictor.is_trained(),
                "model_type": "RandomForestRegressor",
                "features": circularity_predictor.get_feature_names()
            }
        }
    }

# Helper functions
def generate_overall_analysis(request: AnalysisRequest, predictions: List[PredictionResult]) -> Dict[str, Any]:
    """Generate overall analysis metrics for the project"""
    
    # Calculate totals
    total_co2 = sum(p.predictedCO2 or 0 for p in predictions)
    total_energy = sum(p.predictedEnergy or 0 for p in predictions)
    avg_recycling_rate = np.mean([p.predictedRecyclingRate or 0 for p in predictions])
    avg_circularity_score = np.mean([p.predictedCircularityScore or 0 for p in predictions])
    
    # Count pathway classifications
    pathway_counts = {}
    for p in predictions:
        if p.pathwayClassification:
            pathway_counts[p.pathwayClassification] = pathway_counts.get(p.pathwayClassification, 0) + 1
    
    # Calculate sustainability rating
    sustainability_rating = calculate_sustainability_rating(avg_circularity_score, avg_recycling_rate, total_co2)
    
    return {
        "totalCO2": total_co2,
        "totalEnergy": total_energy,
        "overallRecyclingRate": avg_recycling_rate,
        "circularityScore": avg_circularity_score,
        "sustainabilityRating": sustainability_rating,
        "pathwayDistribution": pathway_counts,
        "totalProcesses": len(predictions),
        "analyzedAt": datetime.now().isoformat()
    }

def generate_recommendations(request: AnalysisRequest, predictions: List[PredictionResult]) -> List[str]:
    """Generate recommendations based on analysis results"""
    recommendations = []
    
    # Check for low circularity scores
    low_circularity = [p for p in predictions if p.predictedCircularityScore and p.predictedCircularityScore < 50]
    if low_circularity:
        recommendations.append(f"Improve circularity in {len(low_circularity)} processes - focus on material recycling and reusability")
    
    # Check for linear processes
    linear_processes = [p for p in predictions if p.pathwayClassification == 'linear']
    if linear_processes:
        recommendations.append(f"Transform {len(linear_processes)} linear processes to circular pathways")
    
    # Check for low recycling rates
    low_recycling = [p for p in predictions if p.predictedRecyclingRate and p.predictedRecyclingRate < 70]
    if low_recycling:
        recommendations.append(f"Increase recycling rates in {len(low_recycling)} processes")
    
    # Industry-specific recommendations
    if request.industry == 'steel':
        recommendations.append("Consider using electric arc furnaces with scrap steel to reduce CO2 emissions")
    elif request.industry == 'aluminum':
        recommendations.append("Implement closed-loop recycling systems for aluminum products")
    elif request.industry == 'copper':
        recommendations.append("Optimize copper recovery from end-of-life products")
    
    return recommendations

def calculate_sustainability_rating(circularity_score: float, recycling_rate: float, total_co2: float) -> str:
    """Calculate overall sustainability rating"""
    score = 0
    
    # Circularity score (40% weight)
    score += (circularity_score / 100) * 40
    
    # Recycling rate (30% weight)
    score += (recycling_rate / 100) * 30
    
    # CO2 efficiency (30% weight) - lower CO2 is better
    co2_score = max(0, 100 - (total_co2 / 1000))  # Normalize CO2 emissions
    score += (co2_score / 100) * 30
    
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'

def calculate_overall_confidence(predictions: List[PredictionResult]) -> float:
    """Calculate overall confidence score"""
    confidences = [p.confidence for p in predictions if p.confidence is not None]
    return float(np.mean(confidences)) if confidences else 0.0

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

