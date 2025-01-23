import axios from 'axios';
import { identifyPlantWithPlantId } from './plantIdService';
import { mockIdentificationResult } from './mockData';

const VISION_API_KEY = import.meta.env.VITE_AZURE_VISION_API_KEY || '';
const VISION_ENDPOINT = import.meta.env.VITE_AZURE_VISION_ENDPOINT || '';

export interface PlantIdentificationResult {
  id: string;
  metaData: {
    date: string;
    datetime: string;
  };
  images: string[];
  suggestions: Array<{
    id: number;
    plantName: string;
    scientificName: string;
    probability: number;
    plantDetails: {
      commonNames: string[];
      description: string;
      taxonomy: {
        kingdom: string;
        family: string;
        genus: string;
        order: string;
        phylum: string;
        class: string;
      };
      url: string;
      imageUrl: string;
    }
  }>;
  debug?: {
    description: any;
    tags: any[];
    objects: any[];
    brands: any[];
    metadata: any;
  };
}

// 辅助函数：将 base64 转换为 Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// 通用植物标签，这些标签不够具体，应该被过滤掉
const GENERIC_PLANT_TERMS = new Set([
  'plant',
  'terrestrial plant',
  'vascular plant',
  'flowering plant',
  'houseplant',
  'indoor plant',
  'potted plant',
  'garden',
  'nature',
  'flora'
]);

// 常见室内植物映射
const COMMON_HOUSEPLANTS: Record<string, string[]> = {
  'monstera': ['split leaf', 'swiss cheese', 'large leaves', 'tropical', 'holes', 'fenestration'],
  'snake plant': ['upright', 'sword-like', 'vertical', 'striped'],
  'pothos': ['trailing', 'heart-shaped', 'vine'],
  'peace lily': ['white flower', 'dark green', 'spadix'],
  'fiddle leaf fig': ['violin-shaped', 'large leaves', 'tropical'],
  'zz plant': ['dark green', 'glossy', 'stems'],
  'philodendron': ['heart-shaped', 'climbing', 'tropical'],
  'spider plant': ['arching leaves', 'striped', 'babies'],
  'aloe vera': ['succulent', 'spiky', 'medicinal'],
  'rubber plant': ['burgundy', 'thick leaves', 'rubber']
};

const findSpecificPlant = (tags: any[], caption: string): string | null => {
  const allText = caption.toLowerCase() + ' ' + 
    tags.map(t => t.name.toLowerCase()).join(' ');

  // 为每种植物计算匹配分数
  const scores = Object.entries(COMMON_HOUSEPLANTS).map(([plant, features]) => {
    const score = features.reduce((acc, feature) => {
      return acc + (allText.includes(feature) ? 1 : 0);
    }, 0);
    return { plant, score };
  });

  // 获取最高分的植物
  const bestMatch = scores.reduce((best, current) => {
    return current.score > best.score ? current : best;
  }, { plant: '', score: 0 });

  return bestMatch.score >= 2 ? bestMatch.plant : null;
};

const transformToResult = async (
  visionData: any,
  imageBase64: string
): Promise<PlantIdentificationResult> => {
  console.log('=== Vision API Complete Response ===');
  console.log('Description:', JSON.stringify(visionData.description, null, 2));
  console.log('Tags:', JSON.stringify(visionData.tags, null, 2));
  console.log('Objects:', JSON.stringify(visionData.objects, null, 2));
  console.log('Brands:', JSON.stringify(visionData.brands, null, 2));
  console.log('Metadata:', JSON.stringify(visionData.metadata, null, 2));
  console.log('=== End Vision API Response ===\n');
  
  console.log('Vision API response data:', visionData);
  
  // 从 caption 和 objects 中提取信息
  const caption = visionData.description?.captions?.[0]?.text || '';
  const objects = visionData.objects || [];
  console.log('Image caption:', caption);
  console.log('Detected objects:', objects);

  // 合并所有可能的标签来源
  const allTags = [
    ...visionData.tags,
    ...objects.map((obj: any) => ({ name: obj.object, confidence: obj.confidence }))
  ];

  // 从标签中找出植物相关的标签，但排除通用标签
  const plantTags = allTags
    .filter((tag: any) => {
      console.log('Checking tag:', tag);
      const name = tag.name.toLowerCase();
      // 排除置信度低的和通用植物标签
      if (tag.confidence < 0.5 || GENERIC_PLANT_TERMS.has(name)) {
        return false;
      }
      return true;
    })
    .sort((a: any, b: any) => b.confidence - a.confidence);

  console.log('Filtered plant tags:', plantTags);

  // 尝试识别具体的植物
  const specificPlant = findSpecificPlant(plantTags, caption);
  console.log('Specific plant identified:', specificPlant);

  if (specificPlant) {
    plantTags.unshift({
      name: specificPlant,
      confidence: 0.8
    });
  }

  // 如果没有找到任何标签，使用默认值
  if (plantTags.length === 0) {
    plantTags.push({
      name: 'monstera deliciosa',
      confidence: 0.4
    });
  }

  // 获取前三个最可能的植物标签
  const topTags = plantTags.slice(0, 3);
  console.log('Top 3 plant tags:', topTags);

  // 使用 Bing Search 获取每个标签的详细信息
  const suggestions = await Promise.all(
    topTags.map(async (tag: any, index: number) => {
      // 为每个标签添加更具体的搜索词
      const searchTerm = `${tag.name} houseplant species`;
      console.log(`Searching Bing for: ${searchTerm}`);
      const details = await searchPlantInfo(searchTerm);
      console.log(`Bing search results for ${searchTerm}:`, details);
      
      return {
        id: index + 1,
        plantName: tag.name,
        scientificName: details.scientificName || '',
        probability: tag.confidence,
        plantDetails: {
          commonNames: details.commonNames || [tag.name],
          description: details.description || caption || '',
          taxonomy: {
            kingdom: 'Plantae',
            family: details.taxonomy?.family || '',
            genus: details.taxonomy?.genus || '',
            order: details.taxonomy?.order || '',
            phylum: 'Tracheophyta',
            class: 'Unknown'
          },
          url: `https://www.bing.com/search?q=${encodeURIComponent(tag.name + ' houseplant care guide')}`,
          imageUrl: details.imageUrl || ''
        }
      };
    })
  );

  return {
    id: `plant-${Date.now()}`,
    metaData: {
      date: new Date().toISOString().split('T')[0],
      datetime: new Date().toISOString()
    },
    images: [imageBase64],
    suggestions,
    debug: {
      description: visionData.description,
      tags: visionData.tags,
      objects: visionData.objects,
      brands: visionData.brands,
      metadata: visionData.metadata
    }
  };
};

export const identifyPlant = async (imageBase64: string): Promise<PlantIdentificationResult> => {
  // 使用 Plant.id API
  try {
    return await identifyPlantWithPlantId(imageBase64);
  } catch (error: any) {
    console.error('Error identifying plant:', error);
    
    // 如果 API key 未配置，使用 mock 数据
    if (error.message === 'Plant.id API key is not configured') {
      console.log('Using mock data as API key is not configured');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockIdentificationResult);
        }, 1500);
      });
    }
    
    throw error;
  }
};
