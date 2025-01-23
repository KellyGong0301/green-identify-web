import axios from 'axios';

// 登录并获取令牌
const login = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    return response.data.token;
  } catch (error: any) {
    console.error('Login failed:', error.response?.data);
    return null;
  }
};

// 测试 Plant.id API
export const testPlantIdAPI = async (token: string) => {
  try {
    console.log('Testing Plant.id API...');

    // 使用一个简单的 1x1 像素的 base64 图片进行测试
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const response = await axios.post(
      'http://localhost:3001/api/plant/identify',
      { image: base64Image },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Plant.id API Response:', {
      status: response.status,
      data: response.data
    });
    
    return true;
  } catch (error: any) {
    console.error('Plant.id API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return false;
  }
};

// 测试 Azure OpenAI API
export const testOpenAIAPI = async (token: string) => {
  try {
    console.log('Testing Azure OpenAI API...');

    const response = await axios.post(
      'http://localhost:3001/api/plant/care',
      {
        commonName: "玫瑰",
        scientificName: "Rosa",
        description: "一种常见的观赏花卉"
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Azure OpenAI API Response:', {
      status: response.status,
      data: response.data
    });
    
    return true;
  } catch (error: any) {
    console.error('Azure OpenAI API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return false;
  }
};

// 运行测试
export const runTests = async () => {
  console.log('Starting API Tests...');
  
  console.log('1. Logging in...');
  const token = await login();
  if (!token) {
    console.log('Login failed, cannot proceed with tests');
    return;
  }
  console.log('Login successful');
  
  console.log('\n2. Testing Plant.id API');
  const plantIdResult = await testPlantIdAPI(token);
  console.log('Plant.id API Test:', plantIdResult ? 'PASSED' : 'FAILED');
  
  console.log('\n3. Testing Azure OpenAI API');
  const openAIResult = await testOpenAIAPI(token);
  console.log('Azure OpenAI API Test:', openAIResult ? 'PASSED' : 'FAILED');
  
  console.log('\nTest Summary:');
  console.log('Plant.id API:', plantIdResult ? '✅' : '❌');
  console.log('Azure OpenAI API:', openAIResult ? '✅' : '❌');
};

// 自动运行测试
runTests();
