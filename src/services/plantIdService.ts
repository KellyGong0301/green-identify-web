import axios from 'axios';
import { PlantIdentificationResult } from '../types/plant';
import { PLANT_ENDPOINTS } from '../api/config';
import { getAuthHeader } from '../api/config';

const PLANT_ID_API_KEY = import.meta.env.VITE_PLANT_ID_API_KEY;
const API_ENDPOINT = 'https://api.plant.id/v3/identification';

interface PlantIdResponse {
  result: {
    classification: {
      suggestions: Array<{
        name: string;
        probability: number;
        details?: {
          common_names?: string[];
          taxonomy?: {
            class: string;
            family: string;
            genus: string;
            kingdom: string;
            order: string;
            phylum: string;
          };
          url?: string;
          description?: string;
          image_url?: string;
        };
      }>;
    };
    is_plant: {
      probability: number;
      binary: boolean;
    };
    is_healthy: {
      probability: number;
      binary: boolean;
    };
  };
  status: string;
  sla_compliant_client: boolean;
  created: string;
  completed: string;
}

export const identifyPlantWithPlantId = async (imageBase64: string): Promise<PlantIdentificationResult> => {
  try {
    console.log('Starting plant identification with Plant.id...');
    
    const response = await axios.post(
      PLANT_ENDPOINTS.identify,
      { image: imageBase64 },
      { headers: { ...getAuthHeader() } }
    );

    const result = response.data;
    
    if (!result.result?.classification?.suggestions?.length) {
      throw new Error('No plant matches found');
    }

    const bestMatch = result.result.classification.suggestions[0];
    
    return {
      scientificName: bestMatch.name,
      commonName: bestMatch.details?.common_names?.[0] || bestMatch.name,
      description: bestMatch.details?.description || '',
      probability: bestMatch.probability,
      imageUrl: `data:image/jpeg;base64,${imageBase64}`,  // 添加正确的 data URL 前缀
      taxonomy: bestMatch.details?.taxonomy || {
        kingdom: 'Plantae',
        family: '',
        genus: '',
        order: '',
        phylum: '',
        class: ''
      }
    };
  } catch (error) {
    console.error('Error in plant identification:', error);
    throw error;
  }
};
