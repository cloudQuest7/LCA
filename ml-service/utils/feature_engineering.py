import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class FeatureEngineer:
    """Engineer features for ML models"""
    
    def __init__(self):
        self.preprocessor = None  # Will be injected
        self.feature_scaling_params = {}
    
    def extract_features(self, processed_data: Dict[str, Any], industry: str) -> np.ndarray:
        """Extract and engineer features for ML prediction"""
        try:
            features = {}
            
            # Basic process features
            features['process_type_encoded'] = self._encode_process_type(processed_data.get('type', ''))
            features['industry_encoded'] = self._encode_industry(industry)
            features['data_quality_encoded'] = self._encode_data_quality(processed_data.get('data_quality', 'medium'))
            
            # Energy features
            features['energy_electricity_amount'] = processed_data.get('energy_electricity_amount', 0)
            features['energy_fuel_amount'] = processed_data.get('energy_fuel_amount', 0)
            
            # Material features
            features['raw_material_amount'] = processed_data.get('raw_material_amount', 0)
            features['recycled_content_avg'] = processed_data.get('recycled_content_avg', 0)
            features['material_type_encoded'] = processed_data.get('material_type_encoded', 0)
            
            # Environmental impact features
            features['co2_emissions_amount'] = processed_data.get('co2_emissions_amount', 0)
            features['water_use_amount'] = processed_data.get('water_use_amount', 0)
            features['waste_amount'] = processed_data.get('waste_amount', 0)
            
            # Circularity features
            features['recyclability_score'] = processed_data.get('recyclability_score', 0)
            features['reusability_score'] = processed_data.get('reusability_score', 0)
            features['durability_years'] = processed_data.get('durability_years', 0)
            features['repairability_score'] = processed_data.get('repairability_score', 0)
            
            # Transport features
            features['transport_distance'] = processed_data.get('transport_distance', 0)
            
            # End of life features
            features['end_of_life_recycling_percentage'] = processed_data.get('end_of_life_recycling_percentage', 0)
            
            # Derived features
            features['energy_intensity'] = processed_data.get('energy_intensity', 0)
            features['material_intensity'] = processed_data.get('material_intensity', 0)
            features['co2_intensity'] = processed_data.get('co2_intensity', 0)
            features['waste_generation_rate'] = processed_data.get('waste_generation_rate', 0)
            features['water_intensity'] = processed_data.get('water_intensity', 0)
            
            # Advanced engineered features
            features.update(self._create_advanced_features(processed_data, industry))
            
            # Convert to numpy array
            feature_array = np.array(list(features.values())).reshape(1, -1)
            
            # Apply feature scaling if parameters are available
            if self.feature_scaling_params:
                feature_array = self._apply_scaling(feature_array)
            
            return feature_array
            
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            return np.zeros((1, 25))  # Return zeros if error
    
    def _create_advanced_features(self, processed_data: Dict[str, Any], industry: str) -> Dict[str, float]:
        """Create advanced engineered features"""
        features = {}
        
        # Circularity composite score
        circularity_features = [
            processed_data.get('recyclability_score', 0),
            processed_data.get('reusability_score', 0),
            processed_data.get('repairability_score', 0),
            processed_data.get('end_of_life_recycling_percentage', 0)
        ]
        features['circularity_score'] = np.mean(circularity_features)
        
        # Environmental impact composite score
        env_features = [
            processed_data.get('co2_emissions_amount', 0),
            processed_data.get('waste_amount', 0),
            processed_data.get('water_use_amount', 0)
        ]
        features['environmental_impact_score'] = np.mean(env_features)
        
        # Resource efficiency score
        efficiency_features = [
            processed_data.get('energy_intensity', 0),
            processed_data.get('material_intensity', 0),
            processed_data.get('waste_generation_rate', 0)
        ]
        features['resource_efficiency_score'] = 1.0 - np.mean(efficiency_features)  # Lower is better
        
        # Sustainability composite score
        features['sustainability_score'] = (
            features['circularity_score'] * 0.4 +
            (100 - features['environmental_impact_score']) * 0.3 +
            features['resource_efficiency_score'] * 100 * 0.3
        )
        
        # Industry-specific features
        features.update(self._create_industry_features(processed_data, industry))
        
        # Process complexity score
        features['process_complexity'] = self._calculate_process_complexity(processed_data)
        
        # Material value score
        features['material_value_score'] = self._calculate_material_value(processed_data)
        
        return features
    
    def _create_industry_features(self, processed_data: Dict[str, Any], industry: str) -> Dict[str, float]:
        """Create industry-specific features"""
        features = {}
        
        if industry.lower() == 'steel':
            # Steel-specific features
            features['steel_recycling_potential'] = min(processed_data.get('recycled_content_avg', 0) * 1.2, 100)
            features['steel_energy_efficiency'] = 1.0 - (processed_data.get('energy_intensity', 0) / 10)
            
        elif industry.lower() == 'aluminum':
            # Aluminum-specific features
            features['aluminum_recycling_potential'] = min(processed_data.get('recycled_content_avg', 0) * 1.5, 100)
            features['aluminum_energy_efficiency'] = 1.0 - (processed_data.get('energy_intensity', 0) / 15)
            
        elif industry.lower() == 'copper':
            # Copper-specific features
            features['copper_recycling_potential'] = min(processed_data.get('recycled_content_avg', 0) * 1.3, 100)
            features['copper_energy_efficiency'] = 1.0 - (processed_data.get('energy_intensity', 0) / 12)
            
        else:
            # Generic features for other industries
            features['generic_recycling_potential'] = processed_data.get('recycled_content_avg', 0)
            features['generic_energy_efficiency'] = 1.0 - (processed_data.get('energy_intensity', 0) / 10)
        
        return features
    
    def _calculate_process_complexity(self, processed_data: Dict[str, Any]) -> float:
        """Calculate process complexity score"""
        complexity_factors = [
            processed_data.get('energy_electricity_amount', 0) > 0,
            processed_data.get('energy_fuel_amount', 0) > 0,
            processed_data.get('transport_distance', 0) > 0,
            processed_data.get('waste_amount', 0) > 0,
            processed_data.get('water_use_amount', 0) > 0,
            processed_data.get('recycled_content_avg', 0) > 0
        ]
        
        return sum(complexity_factors) / len(complexity_factors)
    
    def _calculate_material_value(self, processed_data: Dict[str, Any]) -> float:
        """Calculate material value score based on type and properties"""
        material_type = processed_data.get('material_type_encoded', 0)
        recycled_content = processed_data.get('recycled_content_avg', 0)
        
        # Base value by material type (higher = more valuable)
        material_values = {
            0: 0.7,  # steel
            1: 0.9,  # aluminum
            2: 0.8,  # copper
            3: 1.0,  # gold
            4: 0.6,  # iron
            5: 0.3,  # plastic
            6: 0.4,  # glass
            7: 0.5   # other
        }
        
        base_value = material_values.get(material_type, 0.5)
        recycled_bonus = recycled_content / 100 * 0.2  # Bonus for recycled content
        
        return min(base_value + recycled_bonus, 1.0)
    
    def _encode_process_type(self, process_type: str) -> int:
        """Encode process type to integer"""
        encoding = {
            'mining': 0, 'processing': 1, 'transport': 2,
            'manufacturing': 3, 'end_of_life': 4
        }
        return encoding.get(process_type.lower(), 4)
    
    def _encode_industry(self, industry: str) -> int:
        """Encode industry to integer"""
        encoding = {
            'steel': 0, 'aluminum': 1, 'copper': 2,
            'gold': 3, 'iron_ore': 4, 'other': 5
        }
        return encoding.get(industry.lower(), 5)
    
    def _encode_data_quality(self, data_quality: str) -> int:
        """Encode data quality to integer"""
        encoding = {'high': 2, 'medium': 1, 'low': 0}
        return encoding.get(data_quality.lower(), 1)
    
    def _apply_scaling(self, features: np.ndarray) -> np.ndarray:
        """Apply feature scaling if parameters are available"""
        try:
            if 'mean' in self.feature_scaling_params and 'std' in self.feature_scaling_params:
                mean = np.array(self.feature_scaling_params['mean'])
                std = np.array(self.feature_scaling_params['std'])
                return (features - mean) / (std + 1e-8)  # Add small epsilon to avoid division by zero
            return features
        except Exception as e:
            logger.error(f"Error applying feature scaling: {str(e)}")
            return features
    
    def set_scaling_params(self, mean: List[float], std: List[float]):
        """Set feature scaling parameters"""
        self.feature_scaling_params = {
            'mean': mean,
            'std': std
        }
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names"""
        return [
            'process_type_encoded',
            'industry_encoded',
            'data_quality_encoded',
            'energy_electricity_amount',
            'energy_fuel_amount',
            'raw_material_amount',
            'recycled_content_avg',
            'material_type_encoded',
            'co2_emissions_amount',
            'water_use_amount',
            'waste_amount',
            'recyclability_score',
            'reusability_score',
            'durability_years',
            'repairability_score',
            'transport_distance',
            'end_of_life_recycling_percentage',
            'energy_intensity',
            'material_intensity',
            'co2_intensity',
            'waste_generation_rate',
            'water_intensity',
            'circularity_score',
            'environmental_impact_score',
            'resource_efficiency_score',
            'sustainability_score',
            'process_complexity',
            'material_value_score'
        ]

