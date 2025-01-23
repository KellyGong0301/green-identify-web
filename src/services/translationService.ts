import axios from 'axios';
import { OPENAI_ENDPOINTS } from '../api/config';
import { getAuthHeader } from '../api/config';

export async function translateToZh(text: string): Promise<string> {
  if (!text) return '';
  
  try {
    const response = await axios.post(
      OPENAI_ENDPOINTS.translate,
      { text },
      { headers: { ...getAuthHeader() } }
    );

    return response.data.translation || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 如果翻译失败，返回原文
  }
}
