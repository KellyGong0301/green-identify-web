import axios from 'axios';

const BING_API_KEY = import.meta.env.VITE_BING_SEARCH_API_KEY;
const BING_ENDPOINT = import.meta.env.VITE_BING_SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0';

interface BingSearchResult {
  scientificName?: string;
  description?: string;
  taxonomy?: {
    family?: string;
    genus?: string;
    order?: string;
  };
  commonNames?: string[];
  imageUrl?: string;
}

export const searchPlantInfo = async (plantName: string): Promise<BingSearchResult> => {
  try {
    // 搜索植物的详细信息
    const searchQuery = `${plantName} plant scientific name taxonomy`;
    const response = await axios.get(`${BING_ENDPOINT}/search`, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY,
      },
      params: {
        q: searchQuery,
        count: 5,
        responseFilter: 'Webpages',
        mkt: 'en-US',
      },
    });

    const result: BingSearchResult = {};
    const pages = response.data.webPages.value;

    // 分析搜索结果
    for (const page of pages) {
      const text = (page.snippet + ' ' + page.name).toLowerCase();
      
      // 尝试提取学名（通常是斜体或在括号中的拉丁文）
      const scientificMatch = text.match(/\b([A-Z][a-z]+ [a-z]+)\b/);
      if (scientificMatch && !result.scientificName) {
        result.scientificName = scientificMatch[1];
      }

      // 尝试提取科属
      const familyMatch = text.match(/family:\s*([A-Za-z]+aceae)/i);
      if (familyMatch) {
        result.taxonomy = result.taxonomy || {};
        result.taxonomy.family = familyMatch[1];
      }

      const genusMatch = text.match(/genus:\s*([A-Za-z]+)/i);
      if (genusMatch) {
        result.taxonomy = result.taxonomy || {};
        result.taxonomy.genus = genusMatch[1];
      }

      // 提取描述
      if (!result.description && text.length > 100) {
        result.description = page.snippet;
      }
    }

    // 搜索图片
    const imageResponse = await axios.get(`${BING_ENDPOINT}/images/search`, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY,
      },
      params: {
        q: `${plantName} plant`,
        count: 1,
        mkt: 'en-US',
      },
    });

    if (imageResponse.data.value?.length > 0) {
      result.imageUrl = imageResponse.data.value[0].contentUrl;
    }

    // 搜索常用名称
    const commonNamesResponse = await axios.get(`${BING_ENDPOINT}/search`, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY,
      },
      params: {
        q: `${plantName} plant common names`,
        count: 3,
        mkt: 'en-US',
      },
    });

    const commonNamesText = commonNamesResponse.data.webPages.value
      .map((page: any) => page.snippet)
      .join(' ');
    
    // 提取常用名称（通常在引号中或逗号分隔）
    const commonNamesMatches = commonNamesText.match(/"([^"]+)"|'([^']+)'/g);
    if (commonNamesMatches) {
      result.commonNames = commonNamesMatches
        .map(name => name.replace(/['"]/g, ''))
        .filter(name => name.length > 1);
    }

    return result;
  } catch (error) {
    console.error('Error searching plant info:', error);
    return {};
  }
};
