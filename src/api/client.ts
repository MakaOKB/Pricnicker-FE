import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Model, ModelListResponse, ApiError } from '../types';

// 环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
const RETRY_ATTEMPTS = Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3;
const RETRY_DELAY = Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000;

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 安全配置
  withCredentials: false,
  maxRedirects: 5,
});

// 重试机制
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
  // 网络错误或5xx服务器错误时重试
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

const retryRequest = async (config: AxiosRequestConfig, attempt: number = 1): Promise<any> => {
  try {
    return await apiClient(config);
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (attempt < RETRY_ATTEMPTS && shouldRetry(axiosError)) {
      console.warn(`API请求失败，正在进行第${attempt}次重试...`, {
        url: config.url,
        method: config.method,
        error: axiosError.message
      });
      
      await sleep(RETRY_DELAY * attempt); // 指数退避
      return retryRequest(config, attempt + 1);
    }
    
    throw error;
  }
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加请求时间戳，防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // 安全头设置
     if (config.headers) {
       config.headers['Cache-Control'] = 'no-cache';
       config.headers['Pragma'] = 'no-cache';
     }
    
    // 可以在这里添加认证token等
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.debug('API请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.debug('API响应:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    
    return response;
  },
  (error: AxiosError) => {
    // 详细的错误处理
    let errorMessage = '请求失败';
    let errorCode: string | undefined;
    let errorStatus: number | undefined;
    
    if (error.response) {
       // 服务器响应了错误状态码
       errorStatus = error.response.status;
       const responseData = error.response.data as any;
       errorCode = responseData?.code;
       
       switch (error.response.status) {
         case 400:
           errorMessage = responseData?.message || '请求参数错误';
           break;
        case 401:
          errorMessage = '未授权访问';
          break;
        case 403:
          errorMessage = '访问被禁止';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 429:
          errorMessage = '请求过于频繁，请稍后再试';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务暂时不可用';
          break;
        case 504:
          errorMessage = '网关超时';
          break;
        default:
           errorMessage = responseData?.message || `服务器错误 (${error.response.status})`;
       }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = '网络连接失败，请检查网络设置';
      } else {
        errorMessage = '网络错误，请稍后重试';
      }
    } else {
      // 其他错误
      errorMessage = error.message || '未知错误';
    }
    
    const apiError: ApiError = {
      message: errorMessage,
      code: errorCode,
      status: errorStatus,
    };
    
    console.error('API错误:', {
      message: errorMessage,
      code: errorCode,
      status: errorStatus,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    });
    
    return Promise.reject(apiError);
  }
);

// 带重试功能的API客户端
const apiClientWithRetry = {
  get: (url: string, config?: AxiosRequestConfig) => 
    retryRequest({ ...config, method: 'get', url }),
  post: (url: string, data?: any, config?: AxiosRequestConfig) => 
    retryRequest({ ...config, method: 'post', url, data }),
  put: (url: string, data?: any, config?: AxiosRequestConfig) => 
    retryRequest({ ...config, method: 'put', url, data }),
  delete: (url: string, config?: AxiosRequestConfig) => 
    retryRequest({ ...config, method: 'delete', url }),
};

// 健康检查函数
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn('API健康检查失败:', error);
    return false;
  }
};

// 获取API基础信息
export const getApiInfo = () => ({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  retryAttempts: RETRY_ATTEMPTS,
  retryDelay: RETRY_DELAY,
});

export default apiClient;
export { apiClientWithRetry };