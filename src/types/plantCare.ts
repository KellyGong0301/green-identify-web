export interface PlantCareInfo {
  light: {
    level: string;
    description: string;
    tips: string[];
  };
  water: {
    frequency: string;
    description: string;
    tips: string[];
  };
  temperature: {
    range: string;
    description: string;
    tips: string[];
  };
  soil: {
    type: string;
    description: string;
    tips: string[];
  };
  fertilizer: {
    schedule: string;
    description: string;
    tips: string[];
  };
  maintenance: {
    description: string;
    tips: string[];
  };
}
