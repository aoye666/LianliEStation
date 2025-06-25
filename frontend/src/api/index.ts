import axios from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('auth-token');

const basicUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

type RequestConfig = {
  data?: object;
  headers?: object;
  params?: object;
  [key: string]: any; // 允许扩展其他配置字段
};

const api = {
  get: async (detailedUrl: string, config?: RequestConfig) => {
    try {
      const response = await axios.get(basicUrl + detailedUrl, {
        ...config,
        headers: {
          ...(config?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        params: config?.params,
      });
      return response;
    } catch (error) {
      handleError(error);
    }
  },

  post: async (detailedUrl: string, config?: RequestConfig) => {
    try {
      const response = await axios.post(basicUrl + detailedUrl, config?.data, {
        ...config,
        headers: {
          ...(config?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        params: config?.params,
      });
      return response;
    } catch (error) {
      handleError(error);
    }
  },

  put: async (detailedUrl: string, config?: RequestConfig) => {
    try {
      const response = await axios.put(basicUrl + detailedUrl, config?.data, {
        ...config,
        headers: {
          ...(config?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        params: config?.params,
      });
      return response;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (detailedUrl: string, config?: RequestConfig) => {
    try {
      const response = await axios.delete(basicUrl + detailedUrl, {
        ...config,
        headers: {
          ...(config?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        data: config?.data,
      });
      return response;
    } catch (error) {
      handleError(error);
    }
  },
};

function handleError(error: any) {
  if (axios.isAxiosError(error)) {
    console.error('请求失败:', error.response?.data?.message || '服务器错误');
  } else {
    console.error('未知错误:', error);
  }
  // 可根据需求决定是否抛出、返回或其他
  return null; 
}

export default api;