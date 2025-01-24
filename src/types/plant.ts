export interface PlantIdentificationResult {
  commonName: string;
  scientificName: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  probability: number;
  taxonomy?: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
  };
}
