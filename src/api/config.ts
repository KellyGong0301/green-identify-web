// API 端点配置
export const API_BASE_URL = '/api';

// 认证相关的端点
export const AUTH_ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  me: `${API_BASE_URL}/auth/me`,
};

// 植物相关的端点
export const PLANT_ENDPOINTS = {
  identify: `${API_BASE_URL}/plant/identify`,
  care: `${API_BASE_URL}/plant/care`,
  history: `${API_BASE_URL}/plant/history`,
  details: (id: string) => `${API_BASE_URL}/plant/details/${id}`,
};

// 用户相关的端点
export const USER_ENDPOINTS = {
  stats: `${API_BASE_URL}/user/stats`,
};

// 获取认证头
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
