import { OpenAI } from 'openai';

interface PlantInfo {
  commonName: string;
  scientificName: string;
  description?: string;
}

export class AzureOpenAIService {
  private static instance: AzureOpenAIService;
  private client: OpenAI;

  constructor(config: { apiKey: string; endpoint: string; deployment: string; apiVersion: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint}openai/deployments/${config.deployment}`,
      defaultQuery: { 'api-version': config.apiVersion },
      defaultHeaders: { 'api-key': config.apiKey },
    });
  }

  public static getInstance(): AzureOpenAIService {
    if (!AzureOpenAIService.instance) {
      AzureOpenAIService.instance = new AzureOpenAIService({
        apiKey: process.env.AZURE_OPENAI_KEY || '',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT_ID || '',
        apiVersion: '2023-12-01-preview',
      });
    }
    return AzureOpenAIService.instance;
  }

  public async getPlantCareInfo(plantInfo: PlantInfo) {
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

请以 JSON 格式返回，格式如下：
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
    "description": "详细描述",
    "tips": ["提示1", "提示2"]
  }
}`;

    const response = await this.client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_ID || '',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的园艺专家，擅长为各种植物提供养护建议。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to get plant care information');
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse plant care information');
    }
  }
}
