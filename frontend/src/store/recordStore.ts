// messages、history、favorites 的状态管理

import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import Cookies from "js-cookie"; // 从 cookie 中获取 token

// 获取 token
const token = Cookies.get("auth-token");

interface Response {
  user_id: number;
  response_type: string;
  related_id: number;
  content: string;
  read_status: string;
  created_at: string;
  images: string[];
  image_count: number;
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

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author_id: number;
  campust_id: number;
  status: string;
  created_at: string;
  images: string[];
}

interface RecordState {
  // history 相关的状态管理及方法
  historyGoods: HistoryGoods[];
  historyPosts: HistoryPost[];
  getHistoryGoods: () => Promise<void>;
  removeHistoryGoods: (id: number) => void;
  setPage: () => void;
  page: number;
  clear: () => void;
  initialHistoryGoods: () => Promise<void>;

  // favorites 相关的状态管理及方法
  favoritesGoods: FavoriteGoods[];
  favoritePosts: FavoritePost[];
  getFavoritesGoods: () => Promise<void>;
  addFavoriteGoods: (favoriteGoods: FavoriteGoods) => void;
  removeFavoriteGoods: (favoriteId: number) => void;

  // messages 相关的状态管理及方法
  appeals: Appeal[];
  responses: Response[];
  fetchAppeals: () => Promise<void>; // 获取所有申诉（管理员）
  submitAppeal: (
    id: number,
    type: string,
    content: string,
    images?: File[]
  ) => Promise<void>; // 提交申诉
  searchAppeals: (status?: string) => Promise<void>; // 查询申诉
  updateAppealStatus: (appeal_id: number, status: string) => Promise<void>; // 修改申诉状态（管理员）
  deleteAppeal: (appeal_id: number) => Promise<void>; // 删除申诉（管理员）
  fetchResponses: () => Promise<void>; // 获取当前用户所有回复
  submitResponse: (
    user_id: number,
    response_type: string,
    related_id: number,
    content: string
  ) => Promise<void>; // 提交回复(管理员)
  markResponse: (
    message_id: number,
    type: string,
    status: string
  ) => Promise<void>; // 标记回复为已读

  //forum相关的状态管理及方法
  forumPosts: ForumPost[];
  fetchForumPosts: () => Promise<void>; // 获取论坛帖子列表
}

const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      historyGoods: [],
      forumPosts: [],
      historyPosts: [],
      favoritesGoods: [],
      favoritePosts: [],
      appeals: [],
      responses: [],
      typedResponses: [],
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
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/goods/user-history`,
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
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/goods/user-history`,
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
        axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:5000"
          }/api/goods/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      },

      getFavoritesGoods: async () => {
        // try {
        //   const res = await axios.get<FavoriteGoods[]>(
        //     `${process.env.REACT_APP_API_URL||"http://localhost:5000"}/api/favorites/user/favorites`,
        //     {
        //       headers: {
        //         Authorization: `Bearer ${token}`,
        //       },
        //     }
        //   );
        //   if (res.status === 200 && res.data) {
        //     set({ favoritesGoods: res.data });
        //   } else {
        //     // 如果没有数据或者返回了非 200 状态码，可以添加逻辑处理
        //     console.log("No goods available or unexpected response status");
        //   }
        // } catch (error) {
        //   if (axios.isAxiosError(error)) {
        //     console.error(
        //       "查询收藏失败:",
        //       error.response?.data.message || "服务器错误"
        //     );
        //   } else {
        //     console.error("未知错误:", error);
        //   }
        // }
      },

      addFavoriteGoods: (favoriteGoods) => {
        axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:5000"
          }/api/favorites/add`,
          { id: favoriteGoods.id },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`, // 使用Cookies.get获取最新的token
            },
          }
        );
      },

      removeFavoriteGoods: (favoriteId: number) => {
        axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:5000"
          }/api/favorites/add`,
          favoriteId,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      },

      // 获取全部申诉(管理员)
      fetchAppeals: async () => {
        try {
          const response = await axios.get(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/appeals`
          );
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

      // 提交申诉
      submitAppeal: async (
        id: number,
        content: string,
        type: string,
        images?: File[]
      ) => {
        try {
          const formData = new FormData();
          formData.append("id", id.toString());
          formData.append("content", content);
          formData.append("type", type);
          if (images) {
            images.forEach((image, index) => {
              formData.append(`images[${index}]`, image);
            });
          }

          const response = await axios.post(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/appeals/publish`,
            formData,
            {
              headers: {
                Authorization: `Bearer {token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(response.data.message); // 申诉提交成功
          await get().fetchAppeals(); // 重新获取申诉列表
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

      // 查询当前用户提交的申诉记录
      searchAppeals: async (status?: string) => {
        try {
          const params = status ? { status } : {}; // 如果status存在，则将status作为查询参数
          const response = await axios.get(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/appeals/search`,
            {
              params: params,

              headers: {
                Authorization: `Bearer ${token}`, // 使用Cookies.get获取最新的token
              },
            }
          );
          set({ appeals: response.data.data }); // 更新申诉列表
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

      // 修改申诉状态(管理员)
      updateAppealStatus: async (appeal_id: number, status: string) => {
        try {
          const response = await axios.put(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/appeals/${appeal_id}`,
            { status }
          );
          console.log(response.data.message); // 状态修改成功
          await get().fetchAppeals(); // 重新获取申诉列表
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

      // 删除申诉(管理员)
      deleteAppeal: async (appeal_id: number) => {
        try {
          const response = await axios.delete(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/appeals/${appeal_id}`
          );
          console.log(response.data.message); // 申诉删除成功
          await get().fetchAppeals(); // 重新获取申诉列表
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

      // 获取用户的所有通知消息
      fetchResponses: async () => {
        try {
          const response = await axios.get(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/messages/`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // 使用Cookies.get获取最新的token
              },
            }
          );
          set({ responses: response.data.data }); // 更新回复列表
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

      // (管理员)提交回复
      submitResponse: async (
        user_id: number,
        response_type: string,
        related_id: number,
        content: string
      ) => {
        try {
          const response = await axios.post(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/responses/`,
            {
              user_id,
              response_type,
              related_id,
              content,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // 使用Cookies.get获取最新的token
              },
            }
          );
          console.log(response.data.message); // 回复提交成功
          await get().fetchResponses(); // 重新获取回复列表
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

      // 修改通知状态（已读/未读）
      markResponse: async (
        message_id: number,
        type: string,
        status: string
      ) => {
        try {
          const response = await axios.put(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/messages/status/${message_id}`,
            {
              type: type,
              status: status,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // 使用Cookies.get获取最新的token
              },
            }
          );
          console.log(response.data.message); // 回复标记为已读成功
          await get().fetchResponses(); // 重新获取回复列表
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

      fetchForumPosts: async () => {
        try {
          const response = await axios.get(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000"
            }/api/campusWall`
          );
          if (response.status === 200 && response.data) {
            const data = response.data.posts;
            set((state) => ({
              forumPosts: [...data], // 更新 goods 状态
            }));
          } else {
            // 如果没有数据或者返回了非 200 状态码，可以添加逻辑处理
            console.log("No posts available or unexpected response status");
          }
        } catch (error) {
          // 捕获请求失败的错误（如 404 或网络问题）
          if (error instanceof Error) {
            console.error("Error fetching posts:", error.message);
          } else {
            console.error("Error fetching posts:", error);
          }
        }
      },
    }),
    {
      name: "recordStore", // 储存的唯一名称
    }
  )
);

export default useRecordStore;
