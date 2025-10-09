import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd'; 

const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 3000,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 只处理网络异常或服务器挂掉等全局错误
    if (!error.response) {
      message.error('网络异常，请检查网络连接');
    }
    return Promise.reject(error); // 只抛出错误，不做细致区分
  }
);

const api = {
  get: (url: string, config?: object) => apiInstance.get(url, config),
  post: (url: string, data?: object, config?: object) => apiInstance.post(url, data, config),
  put: (url: string, data?: object, config?: object) => apiInstance.put(url, data, config),
  delete: (url: string, config?: object) => apiInstance.delete(url, config),
};

// AI相关接口
export const aiAPI = {
  // AI敏感词检测
  checkSensitive: async (text: string) => {
    try {
      const response = await api.post('/api/aiTemplate/check-sensitive', { text });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('敏感词检测失败');
    }
  },

  // AI生成商品模板
  generateTemplate: async (text: string) => {
    try {
      const response = await api.post('/api/aiTemplate/generate', { text });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('生成模板失败');
    }
  },

  // 获取AI调用统计
  getStats: async () => {
    try {
      const response = await api.get('/api/aiTemplate/stats');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('获取统计失败');
    }
  }
};

export default api;