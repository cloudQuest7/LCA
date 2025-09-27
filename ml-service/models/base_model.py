from abc import ABC, abstractmethod
import joblib
import os
import numpy as np
from typing import List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class BaseMLModel(ABC):
    """Base class for all ML models in the LCA system"""
    
    def __init__(self, model_name: str, model_type: str):
        self.model_name = model_name
        self.model_type = model_type
        self.model = None
        self.feature_names = []
        self.is_trained_flag = False
        self.model_path = f"./models/{model_name}.joblib"
        
    @abstractmethod
    def _create_model(self):
        """Create the specific model instance"""
        pass
    
    @abstractmethod
    def _get_feature_names(self) -> List[str]:
        """Get the expected feature names for this model"""
        pass
    
    def train(self, X, y, **kwargs):
        """Train the model with given data"""
        try:
            if self.model is None:
                self.model = self._create_model()
            
            self.model.fit(X, y)
            self.feature_names = self._get_feature_names()
            self.is_trained_flag = True
            
            # Save the trained model
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            
            logger.info(f"{self.model_name} trained successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error training {self.model_name}: {str(e)}")
            return False
    
    def load_model(self):
        """Load a pre-trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.feature_names = self._get_feature_names()
                self.is_trained_flag = True
                logger.info(f"{self.model_name} loaded successfully")
                return True
            else:
                logger.warning(f"No pre-trained model found for {self.model_name}")
                return False
        except Exception as e:
            logger.error(f"Error loading {self.model_name}: {str(e)}")
            return False
    
    def predict(self, X) -> Optional[np.ndarray]:
        """Make predictions on new data"""
        if not self.is_trained_flag or self.model is None:
            logger.warning(f"{self.model_name} is not trained")
            return None
        
        try:
            # Ensure X has the right shape and features
            if hasattr(X, 'values'):
                X = X.values
            
            if len(X.shape) == 1:
                X = X.reshape(1, -1)
            
            predictions = self.model.predict(X)
            return predictions
        except Exception as e:
            logger.error(f"Error making predictions with {self.model_name}: {str(e)}")
            return None
    
    def get_confidence(self, X) -> Optional[float]:
        """Get prediction confidence (if available)"""
        if not self.is_trained_flag or self.model is None:
            return None
        
        try:
            if hasattr(self.model, 'predict_proba'):
                # For classification models
                proba = self.model.predict_proba(X)
                return float(np.max(proba))
            elif hasattr(self.model, 'decision_function'):
                # For some models with decision function
                decision = self.model.decision_function(X)
                return float(np.abs(decision[0]) / (np.abs(decision[0]) + 1))
            else:
                # For regression models, use a simple confidence based on prediction variance
                return 0.8  # Default confidence
        except Exception as e:
            logger.error(f"Error getting confidence for {self.model_name}: {str(e)}")
            return None
    
    def is_trained(self) -> bool:
        """Check if the model is trained"""
        return self.is_trained_flag
    
    def get_feature_names(self) -> List[str]:
        """Get the feature names used by this model"""
        return self.feature_names
    
    def get_model_info(self) -> dict:
        """Get information about the model"""
        return {
            "name": self.model_name,
            "type": self.model_type,
            "trained": self.is_trained_flag,
            "features": self.feature_names,
            "model_path": self.model_path
        }

