import { create } from 'zustand';
import axios from 'axios';

interface Appeal {
  id: number;
  author_id: number;
  post_id: number;
  content: string;
  status: string;
  created_at: string;
}

interface AppealState {
  appeals: Appeal[]; // 存储所有申诉
  fetchAppeals: () => Promise<void>; // 获取所有申诉
  submitAppeal: (author_id: number, post_id: number, content: string) => Promise<void>; // 提交申诉
  searchAppeals: (author_id?: number, post_id?: number, status?: string) => Promise<void>; // 查询申诉
  updateAppealStatus: (appeal_id: number, status: string) => Promise<void>; // 修改申诉状态
  deleteAppeal: (appeal_id: number) => Promise<void>; // 删除申诉
}

const useAppealStore = create<AppealState>((set) => ({
  appeals: [],

  fetchAppeals: async () => {
    try {
      const response = await axios.get('/api/appeals');
      set({ appeals: response.data }); // 更新申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('获取申诉失败:', error.response?.data.message || '服务器错误');
      } else {
        console.error('未知错误:', error);
      }
    }
  },

  submitAppeal: async (author_id: number, post_id: number, content: string) => {
    try {
      const response = await axios.post('/api/appeals/publish', { author_id, post_id, content });
      console.log(response.data.message); // 申诉提交成功
      await useAppealStore.getState().fetchAppeals(); // 重新获取申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('提交申诉失败:', error.response?.data.message || '服务器错误');
      } else {
        console.error('未知错误:', error);
      }
    }
  },

  searchAppeals: async (author_id?: number, post_id?: number, status?: string) => {
    const params: { [key: string]: any } = {};
    if (author_id) params.author_id = author_id;
    if (post_id) params.post_id = post_id;
    if (status) params.status = status;

    try {
      const response = await axios.get('/api/appeals/search', { params });
      set({ appeals: response.data }); // 更新申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('查询申诉失败:', error.response?.data.message || '服务器错误');
      } else {
        console.error('未知错误:', error);
      }
    }
  },

  updateAppealStatus: async (appeal_id: number, status: string) => {
    try {
      const response = await axios.put(`/api/appeals/${appeal_id}`, { status });
      console.log(response.data.message); // 状态修改成功
      await useAppealStore.getState().fetchAppeals(); // 重新获取申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('修改申诉状态失败:', error.response?.data.message || '服务器错误');
      } else {
        console.error('未知错误:', error);
      }
    }
  },

  deleteAppeal: async (appeal_id: number) => {
    try {
      const response = await axios.delete(`/api/appeals/${appeal_id}`);
      console.log(response.data.message); // 申诉删除成功
      await useAppealStore.getState().fetchAppeals(); // 重新获取申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('删除申诉失败:', error.response?.data.message || '服务器错误');
      } else {
        console.error('未知错误:', error);
      }
    }
  },
}));

export default useAppealStore;
