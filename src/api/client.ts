import axios from 'axios';
import { Model, ModelListResponse, ApiError } from '../types';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4523/m1/7116962-6839767-6186241',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 如果没有设置自定义的API基础URL，添加apifox参数
    if (!import.meta.env.VITE_API_BASE_URL) {
      // 为品牌相关的API端点使用不同的apifoxApiId
      const isBrandApi = config.url && config.url.includes('/brand/');
      config.params = {
        ...config.params,
        apifoxApiId: isBrandApi ? '349841956' : '349841955'
      };
    }
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || '请求失败',
      code: error.response?.data?.code,
      status: error.response?.status,
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;