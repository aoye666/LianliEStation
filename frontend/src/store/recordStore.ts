// messages、history、favorites 的状态管理

import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie"; // 从 cookie 中获取 token

const token = Cookies.get("token"); // 获取 token

interface Response {
  user_id: number;
  response_type: string;
  related_id: number;
  content: string;
  read_status: string;
  created_at: string;
}

interface Appeal {
  author_id: number;
  goods_id: number;
  content: string;
  status: string;
  created_at: string;
  image_url: string[];
}

interface FavoriteGoods {
  id: number;
  title: string;
  content: string | null;
  goods_type: "receive" | "sell";
  tag: string | null;
  author_id: number;
  created_at: string;
  status: "active" | "inactive" | "deleted";
  price: number;
  campus_id: number;
  images: string[];
}

interface FavoritePost {
  id: number;
  title: string;
  content: string | null;
  // 待具体开发时补充
}
interface HistoryPost {
  id: number;
  title: string;
  content: string | null;
  // 待具体实现时补充
}

interface HistoryGoods {
  id: number;
  title: string;
  content: string | null;
  goods_type: "receive" | "sell";
  tag: string | null;
  author_id: number;
  created_at: string;
  status: "active" | "inactive" | "deleted";
  price: number;
  campus_id: number;
  images: string[];
}

interface MessageState {
  historyGoods: HistoryGoods[];
  historyPosts: HistoryPost[];
  getHistoryGoods: () => Promise<void>;
  removeHistoryGoods: (id: number) => void;
  setPage: () => void;
  page: number;
  clear: () => void;
  initialHistoryGoods: () => Promise<void>;
  favoritesGoods: FavoriteGoods[];
  favoritePosts: FavoritePost[];
  getFavoritesGoods: () => Promise<void>;
  addFavoriteGoods: (favoriteGoods: FavoriteGoods) => void;
  removeFavoriteGoods: (favoriteId: number) => void;
  appeals: Appeal[];
  responses: Response[];
  typedResponses: Response[];
  fetchAppeals: () => Promise<void>; // 获取所有申诉（管理员）
  submitAppeal: (
    goods_id: number,
    content: string,
    images: string[]
  ) => Promise<void>; // 提交申诉
  searchAppeals: (status: string) => Promise<void>; // 查询申诉
  updateAppealStatus: (appeal_id: number, status: string) => Promise<void>; // 修改申诉状态（管理员）
  deleteAppeal: (appeal_id: number) => Promise<void>; // 删除申诉（管理员）
  fetchResponses: () => Promise<void>; // 获取当前用户所有回复
  submitResponse: (
    user_id: number,
    response_type: string,
    related_id: number,
    content: string
  ) => Promise<void>; // 提交回复
  markResponse: (response_id: number) => Promise<void>; // 标记回复为已读
  searchResponses: (read_status: string) => Promise<void>; // 查询回复
}

const useMessageStore = create<MessageState>((set, get) => ({
  historyGoods: [],
  page: 1,
  setPage: () =>
    set((preState) => ({
      page: preState.page + 1,
    })),
  clear: () =>
    set(() => ({
      historyGoods: [],
    })),
  initialHistoryGoods: async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/goods/user-history",
        {
          params: {
            page: get().page,
            limit: 12,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 检查返回数据是否有效
      if (response.status === 200 && response.data) {
        const data = response.data.goods;
        set((state) => ({
          historyGoods: [...data], // 更新 goods 状态
        }));
      } else {
        // 如果没有数据或者返回了非 200 状态码，可以添加逻辑处理
        console.log("No goods available or unexpected response status");
      }
    } catch (error) {
      // 捕获请求失败的错误（如 404 或网络问题）
      if (error instanceof Error) {
        console.error("Error fetching goods:", error.message);
      } else {
        console.error("Error fetching goods:", error);
      }
    }
  },
  getHistoryGoods: async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/goods/user-history",
        {
          params: {
            page: get().page,
            limit: 12,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 检查返回数据是否有效
      if (response.status === 200 && response.data) {
        const data = response.data.goods;
        set((state) => ({
          historyGoods: [...state.historyGoods, ...data], // 更新 goods 状态
        }));
      } else {
        // 如果没有数据或者返回了非 200 状态码，可以添加逻辑处理
        console.log("No goods available or unexpected response status");
      }
    } catch (error) {
      // 捕获请求失败的错误（如 404 或网络问题）
      if (error instanceof Error) {
        console.error("Error fetching goods:", error.message);
      } else {
        console.error("Error fetching goods:", error);
      }
    }
  },

  removeHistoryGoods: (id) => {
    axios.delete(`http://localhost:5000/api/goods/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  historyPosts: [],
  favoritesGoods: [],
  favoritePosts: [],
  getFavoritesGoods: async () => {
    const { data } = await axios.get<FavoriteGoods[]>(
      "http://localhost:5000/api/favorites/user/favorites",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    set({ favoritesGoods: data });
  },
  addFavoriteGoods: (favoriteGoods) => {
    axios.post("http://localhost:5000/api/favorites/add", favoriteGoods.id, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  removeFavoriteGoods: (favoriteId: number) => {
    axios.post("http://localhost:5000/api/favorites/add", favoriteId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  appeals: [],
  responses: [],
  typedResponses: [],
  fetchAppeals: async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/appeals");
      set({ appeals: response.data }); // 更新申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "获取申诉失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },

  submitAppeal: async (goods_id: number, content: string, images: string[]) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/appeals/publish",
        { goods_id, content, images: [] }
      );
      console.log(response.data.message); // 申诉提交成功
      await useMessageStore.getState().fetchAppeals(); // 重新获取申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "提交申诉失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },

  searchAppeals: async (status: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/appeals/search/${status}`
      );
      set({ appeals: response.data }); // 更新申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "查询申诉失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },

  updateAppealStatus: async (appeal_id: number, status: string) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/appeals/${appeal_id}`,
        { status }
      );
      console.log(response.data.message); // 状态修改成功
      await useMessageStore.getState().fetchAppeals(); // 重新获取申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "修改申诉状态失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },

  deleteAppeal: async (appeal_id: number) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/appeals/${appeal_id}`
      );
      console.log(response.data.message); // 申诉删除成功
      await useMessageStore.getState().fetchAppeals(); // 重新获取申诉列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "删除申诉失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },
  fetchResponses: async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/responses/");
      set({ responses: response.data }); // 更新回复列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "获取回复失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },

  submitResponse: async (
    user_id: number,
    response_type: string,
    related_id: number,
    content: string
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/responses/",
        {
          user_id,
          response_type,
          related_id,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 必须添加JWT token
          },
        }
      );
      console.log(response.data.message); // 回复提交成功
      await useMessageStore.getState().fetchResponses(); // 重新获取回复列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "提交回复失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },

  markResponse: async (response_id: number) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/responses/${response_id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // 必须添加JWT token
          },
        }
      );
      console.log(response.data.message); // 回复标记为已读成功
      await useMessageStore.getState().fetchResponses(); // 重新获取回复列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "标记回复为已读失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },
  searchResponses: async (read_status: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/responses/${read_status}`
      );
      set({ typedResponses: response.data }); // 更新回复列表
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "获取回复失败:",
          error.response?.data.message || "服务器错误"
        );
      } else {
        console.error("未知错误:", error);
      }
    }
  },
}));

export default useMessageStore;
