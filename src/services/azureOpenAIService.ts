import { AzureOpenAI } from 'openai';

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

export class AzureOpenAIService {
  private client: AzureOpenAI;
  private static instance: AzureOpenAIService;

  private constructor() {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
    const deploymentId = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_ID;
    
    if (!endpoint || !apiKey || !deploymentId) {
      throw new Error('Azure OpenAI credentials not found in environment variables');
    }

    this.client = new AzureOpenAI({
      apiKey,
      endpoint,
      deployment: deploymentId,
      apiVersion: "2023-12-01-preview",
      dangerouslyAllowBrowser: true  // 注意：这只是临时解决方案
    });
  }

  public static getInstance(): AzureOpenAIService {
    if (!AzureOpenAIService.instance) {
      AzureOpenAIService.instance = new AzureOpenAIService();
    }
    return AzureOpenAIService.instance;
  }

  public async getPlantCareInfo(plantInfo: {
    commonName: string;
    scientificName: string;
    description?: string;
  }): Promise<PlantCareInfo> {
    const prompt = `作为一个专业的园艺专家，请为以下植物提供详细的养护指南：

植物名称：${plantInfo.commonName}
学名：${plantInfo.scientificName}
${plantInfo.description ? `描述：${plantInfo.description}` : ''}

请提供以下方面的养护建议，使用中文回答，并确保信息准确、专业和实用：
1. 光照要求（包括光照强度、时长、注意事项）
2. 浇水需求（包括浇水频率、方法、季节性调整）
3. 温度要求（包括适宜温度范围、极限温度、季节性调整）
4. 土壤要求（包括土壤类型、酸碱度、排水要求）
5. 施肥方案（包括肥料类型、施肥频率、季节性调整）
6. 日常护理（包括修剪、病虫害防治、清洁等）

请以JSON格式返回，格式如下：
{
  "light": {
    "level": "光照级别",
    "description": "详细描述",
    "tips": ["提示1", "提示2"]
  },
  "water": {
    "frequency": "浇水频率",
    "description": "详细描述",
    "tips": ["提示1", "提示2"]
  },
  "temperature": {
    "range": "温度范围",
    "description": "详细描述",
    "tips": ["提示1", "提示2"]
  },
  "soil": {
    "type": "土壤类型",
    "description": "详细描述",
    "tips": ["提示1", "提示2"]
  },
  "fertilizer": {
    "schedule": "施肥计划",
    "description": "详细描述",
    "tips": ["提示1", "提示2"]
  },
  "maintenance": {
    "description": "维护说明",
    "tips": ["提示1", "提示2"]
  }
}`;

    try {
      const response = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: '你是一个专业的园艺专家，精通各种植物的养护方法。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message?.content || '';
      try {
        return JSON.parse(content) as PlantCareInfo;
      } catch (e) {
        console.error('Failed to parse OpenAI response:', e);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (error) {
      console.error('Error getting plant care info:', error);
      throw error;
    }
  }
}
