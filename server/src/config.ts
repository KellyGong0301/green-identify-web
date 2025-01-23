const CONFIG = {
  // 前端配置
  CLIENT: {
    PORT: 3000,
    HOST: 'localhost',
  },
  
  // 后端配置
  SERVER: {
    PORT: 3001,
    HOST: 'localhost',
    PORT_RANGE: {
      MIN: 3001,
      MAX: 5001,  // 扩大范围到 5001
    },
  },
  
  // API 配置
  API: {
    PREFIX: '/api',
    TIMEOUT: 10000,
  },
  
  // 开发配置
  DEV: {
    ENABLE_HTTPS: false,
    CORS_ORIGIN: '*',
  },
} as const;

// 生成完整的 URL
const getServerUrl = (port?: number) => {
  const serverPort = port || CONFIG.SERVER.PORT;
  return `http://${CONFIG.SERVER.HOST}:${serverPort}`;
};

const getClientUrl = () => {
  return `http://${CONFIG.CLIENT.HOST}:${CONFIG.CLIENT.PORT}`;
};

const getApiUrl = (port?: number) => {
  return `${getServerUrl(port)}${CONFIG.API.PREFIX}`;
};

export {
  CONFIG,
  getServerUrl,
  getClientUrl,
  getApiUrl,
};
