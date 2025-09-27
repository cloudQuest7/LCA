import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Preprocess data for ML models"""
    
    def __init__(self):
        self.industry_encoding = {
            'steel': 0, 'aluminum': 1, 'copper': 2, 
            'gold': 3, 'iron_ore': 4, 'other': 5
        }
        self.process_type_encoding = {
            'mining': 0, 'processing': 1, 'transport': 2, 
            'manufacturing': 3, 'end_of_life': 4
        }
        self.data_quality_encoding = {
            'high': 2, 'medium': 1, 'low': 0
        }
        self.material_type_encoding = {
            'steel': 0, 'aluminum': 1, 'copper': 2, 'gold': 3, 
            'iron': 4, 'plastic': 5, 'glass': 6, 'other': 7
        }
    
    def preprocess_process(self, process_data: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess a single process for ML prediction"""
        try:
            processed = {}
            
            # Basic process information
            processed['name'] = process_data.get('name', '')
            processed['type'] = process_data.get('type', '')
            processed['data_quality'] = process_data.get('dataQuality', 'medium')
            
            # Raw materials processing
            raw_materials = process_data.get('rawMaterials', [])
            processed['raw_material_amount'] = sum(
                material.get('amount', 0) for material in raw_materials
            )
            processed['recycled_content_avg'] = self._calculate_avg_recycled_content(raw_materials)
            processed['material_type_encoded'] = self._encode_material_type(raw_materials)
            
            # Energy processing
            energy = process_data.get('energy', {})
            processed['energy_electricity_amount'] = energy.get('electricity', {}).get('amount', 0)
            processed['energy_fuel_amount'] = energy.get('fuel', {}).get('amount', 0)
            
            # Environmental impacts
            impacts = process_data.get('impacts', {})
            processed['co2_emissions_amount'] = impacts.get('co2Emissions', {}).get('amount', 0)
            processed['water_use_amount'] = impacts.get('waterUse', {}).get('amount', 0)
            processed['waste_amount'] = impacts.get('waste', {}).get('amount', 0)
            
            # Circularity indicators
            circularity = process_data.get('circularity', {})
            processed['recyclability_score'] = circularity.get('recyclability', 0)
            processed['reusability_score'] = circularity.get('reusability', 0)
            processed['durability_years'] = circularity.get('durability', 0)
            processed['repairability_score'] = circularity.get('repairability', 0)
            
            # Transport
            transport = process_data.get('transport', {})
            processed['transport_distance'] = transport.get('distance', 0)
            
            # End of life
            end_of_life = process_data.get('endOfLife', {})
            processed['end_of_life_recycling_percentage'] = end_of_life.get('recycling', {}).get('percentage', 0)
            
            # Calculate derived features
            processed['energy_intensity'] = self._calculate_energy_intensity(processed)
            processed['material_intensity'] = self._calculate_material_intensity(processed)
            processed['co2_intensity'] = self._calculate_co2_intensity(processed)
            processed['waste_generation_rate'] = self._calculate_waste_generation_rate(processed)
            processed['water_intensity'] = self._calculate_water_intensity(processed)
            
            return processed
            
        except Exception as e:
            logger.error(f"Error preprocessing process data: {str(e)}")
            return {}
    
    def preprocess_features(self, features: Dict[str, Any]) -> np.ndarray:
        """Convert features dictionary to numpy array for ML models"""
        try:
            # Define feature order (should match model expectations)
            feature_names = [
                'process_type_encoded',
                'energy_electricity_amount',
                'energy_fuel_amount',
                'raw_material_amount',
                'recycled_content_avg',
                'transport_distance',
                'water_use_amount',
                'waste_amount',
                'industry_encoded',
                'data_quality_encoded',
                'recyclability_score',
                'reusability_score',
                'durability_years',
                'repairability_score',
                'end_of_life_recycling_percentage',
                'energy_intensity',
                'material_intensity',
                'co2_intensity',
                'waste_generation_rate',
                'water_intensity',
                'material_type_encoded'
            ]
            
            # Extract values in the correct order
            values = []
            for name in feature_names:
                value = features.get(name, 0)
                if isinstance(value, (int, float)):
                    values.append(float(value))
                else:
                    values.append(0.0)
            
            return np.array(values).reshape(1, -1)
            
        except Exception as e:
            logger.error(f"Error preprocessing features: {str(e)}")
            return np.zeros((1, 21))  # Return zeros if error
    
    def _calculate_avg_recycled_content(self, raw_materials: List[Dict]) -> float:
        """Calculate average recycled content from raw materials"""
        if not raw_materials:
            return 0.0
        
        total_content = sum(material.get('recycledContent', 0) for material in raw_materials)
        return total_content / len(raw_materials)
    
    def _encode_material_type(self, raw_materials: List[Dict]) -> int:
        """Encode the primary material type"""
        if not raw_materials:
            return self.material_type_encoding['other']
        
        # Get the most common material type
        material_types = [material.get('name', '').lower() for material in raw_materials]
        
        for material_type, encoding in self.material_type_encoding.items():
            if any(material_type in mat_type for mat_type in material_types):
                return encoding
        
        return self.material_type_encoding['other']
    
    def _calculate_energy_intensity(self, processed: Dict) -> float:
        """Calculate energy intensity (energy per unit material)"""
        total_energy = processed.get('energy_electricity_amount', 0) + processed.get('energy_fuel_amount', 0)
        material_amount = processed.get('raw_material_amount', 1)
        
        if material_amount > 0:
            return total_energy / material_amount
        return 0.0
    
    def _calculate_material_intensity(self, processed: Dict) -> float:
        """Calculate material intensity"""
        material_amount = processed.get('raw_material_amount', 0)
        return min(material_amount / 100, 1.0)  # Normalize to 0-1
    
    def _calculate_co2_intensity(self, processed: Dict) -> float:
        """Calculate CO2 intensity (CO2 per unit material)"""
        co2_amount = processed.get('co2_emissions_amount', 0)
        material_amount = processed.get('raw_material_amount', 1)
        
        if material_amount > 0:
            return co2_amount / material_amount
        return 0.0
    
    def _calculate_waste_generation_rate(self, processed: Dict) -> float:
        """Calculate waste generation rate"""
        waste_amount = processed.get('waste_amount', 0)
        material_amount = processed.get('raw_material_amount', 1)
        
        if material_amount > 0:
            return waste_amount / material_amount
        return 0.0
    
    def _calculate_water_intensity(self, processed: Dict) -> float:
        """Calculate water intensity (water per unit material)"""
        water_amount = processed.get('water_use_amount', 0)
        material_amount = processed.get('raw_material_amount', 1)
        
        if material_amount > 0:
            return water_amount / material_amount
        return 0.0
    
    def encode_industry(self, industry: str) -> int:
        """Encode industry string to integer"""
        return self.industry_encoding.get(industry.lower(), 5)  # Default to 'other'
    
    def encode_process_type(self, process_type: str) -> int:
        """Encode process type string to integer"""
        return self.process_type_encoding.get(process_type.lower(), 4)  # Default to 'end_of_life'
    
    def encode_data_quality(self, data_quality: str) -> int:
        """Encode data quality string to integer"""
        return self.data_quality_encoding.get(data_quality.lower(), 1)  # Default to 'medium'

