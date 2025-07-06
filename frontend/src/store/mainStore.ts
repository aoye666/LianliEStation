import { Alert, message } from "antd";
// 商品与帖子的状态管理
import api from "../api/index";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie"; // 从 cookie 中获取 token

// 获取 token
const token = Cookies.get("auth-token");

interface Goods {
  id: number;
  title: string;
  content: string | null;
  price: number;
  campus_id: number;
  status: "active" | "inactive" | "deleted";
  goods_type: "receive" | "sell";
  tag: string | null;
  author_id: number;
  likes: number;
  complaints: number;
  created_at: string;
  images: string[];
  author_qq_id: string | null;
  author_nickname: string | null;
  author_avatar: string | null;
  author_credit: number;
}

interface Post {
  id: number;
  title: string;
  content: string | null;
}

interface Filters {
  searchTerm: string | null;
  priceRange: [number, number];
  tag: string | null;
  goods_type: "receive" | "sell" | null;
  campus_id: number | null;
}

interface Forum {
  id: number;
  title: string;
  content: string;
  auther_id: number;
  campus_id: number;
  status: "active" | "inactive" | "deleted";
  created_at: string;
  images: string[];
}

interface MainState {
  maxMarketPage: boolean;
  marketPage: number;
  forumPage: number;
  goods: Goods[];
  posts: Post[];
  forums: Forum[];
  filters: Filters;
  clear: () => void;
  fetchGoods: () => Promise<void>;
  setFilters: (newFilters: Partial<Filters>) => void;
  updateGoods: () => Promise<void>;
  setMarketPage: () => void;
  setForumPage: () => void;
  getForumPosts: () => Promise<void>;
  clearGoods: () => void;
  clearFilters: () => void;
  changeGoodsResponse: (
    action: string,
    post_id: string | undefined,
    value: number
  ) => Promise<string | any>;
  publishAppeal: (
    title: string,
    id: number,
    content: string,
    type: string,
    images: File[]
  ) => Promise<boolean>;
  updateGoodsItem: (action: string, post_id: number, value: number) => void;
}

const useMainStore = create<MainState>()(
  persist(
    (set, get) => ({
      marketPage: 1,
      forumPage: 1,
      goods: [],
      forums: [],
      maxMarketPage: false,
      posts: [],
      filters: {
        searchTerm: "",
        goods_type: null,
        tag: "",
        priceRange: [0, 1000000],
        campus_id: null,
      },

      setMarketPage: () => {
        if (!get().maxMarketPage) {
          set((preState) => ({
            marketPage: preState.marketPage + 1,
          }));
        }
      },

      setForumPage: () => {
        set((preState) => ({
          forumPage: preState.forumPage + 1,
        }));
      },
      getForumPosts: async () => {
        try {
          const response = await api.get("/api/campusWall/");
          if (response?.status === 200 && response.data) {
            const data = response.data.posts;
            set((state) => ({
              forums: [...data], // 更新 goods 状态
            }));
            console.log(get().maxMarketPage);
          } else {
            // 如果没有数据或者返回了非 200 状态码，可以添加逻辑处理
            console.log("No goods available or unexpected response status");
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

      fetchGoods: async () => {
        try {
          const response = await api.get(
            "/api/goods",

            {
              page: get().marketPage,
              limit: 12,
              keyword: get().filters.searchTerm,
              goods_type: get().filters.goods_type,
              tag: get().filters.tag,
              min_price: get().filters.priceRange[0],
              max_price: get().filters.priceRange[1],
              campus_id: get().filters.campus_id,
            }
          );

          // console.log(response);
          // 检查返回数据是否有效
          if (response?.status === 200 && response.data) {
            const data = response.data.goods;
            set((state) => ({
              goods: [...data], // 更新 goods 状态
            }));
            console.log(get().maxMarketPage);
          } else {
            // 如果没有数据或者返回了非 200 状态码，可以添加逻辑处理
            console.log("No goods available or unexpected response status");
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

      clear: () =>
        set(() => ({
          goods: [],
          maxMarketPage: false,
          page: 1,
          filters: {
            searchTerm: "",
            goods_type: null,
            tag: null,
            priceRange: [0, 1000000],
            campus_id: null,
          },
        })), // 清空所有状态，包括 posts 等

      clearGoods: () =>
        set(() => ({
          goods: [],
          marketPage: 1,
        })), // 清空 posts 状态

      setFilters: async (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }, // 更新 filters 状态
        }));
      },

      clearFilters: () =>
        set(() => ({
          filters: {
            searchTerm: "",
            goods_type: null,
            tag: null,
            priceRange: [0, 1000000],
            campus_id: null,
          },
        })),

      updateGoods: async () => {
        try {
          const response = await api.get("/api/goods", {
            data: {
              page: get().marketPage,
              limit: 12,
              keyword: get().filters.searchTerm,
              goods_type: get().filters.goods_type,
              tag: get().filters.tag,
              min_price: get().filters.priceRange[0],
              max_price: get().filters.priceRange[1],
              campus_id: get().filters.campus_id,
            },
          });

          // 检查返回数据是否有效
          if (response?.status === 200 && response.data.goods.length > 0) {
            const data = response.data.goods;
            set((state) => ({
              goods: [...state.goods, ...data], // 更新 posts 状态
              maxMarketPage: false,
            }));
          } else if (
            response?.status === 200 &&
            response.data.goods.length === 0
          ) {
            console.log("No more goods available");
            set((state) => ({
              maxMarketPage: true,
              marketPage: state.marketPage - 1,
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

      // 修改商品点赞/投诉数
      changeGoodsResponse: async (
        action: string,
        post_id: string | undefined,
        value: number
      ) => {
        let msg: string | any;
        try {
          const response = await api.put(`/api/goods/${action}/${post_id}`, {
            // 将 post 改为 put
            data: { value: value },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response);
          if (response?.status === 200) {
            if (post_id) {
              set((state) => ({
                ...state,
                goods: state.goods.map((good) =>
                  good.id === parseInt(post_id)
                    ? { ...good, ...response.data }
                    : good
                ),
              }));
              msg = "success";
            }
          } else if (response?.status === 400) {
            // console.log(response.data)
            msg = response;
          }
        } catch (error) {
          console.error(error);
          msg = error;
        }
        return msg;
      },

      // 发布举报
      publishAppeal: async (
        title: string,
        id: number,
        content: string,
        type: string,
        images: File[]
      ) => {
        console.log(title, id, content, type, images);
        try {
          const formData = new FormData();
          formData.append("id", id.toString());
          formData.append("content", content);
          formData.append("type", type);
          formData.append("title", title);
          for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
          }

          const response = await api.post("/api/appeals/publish", {
            data: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response);
          if (response?.status === 201) {
            return true;
          } else {
            message.error("举报失败");
            return false;
          }
        } catch (error) {
          console.error(error);
          message.error("提交举报失败");
          return false;
        }
      },

      updateGoodsItem: (action: string, post_id: number, value: number) => {
        const goods = get().goods;
        const newGoodsItem = goods.filter((item) => item.id === post_id);
        const newGoods: Goods[] = goods.filter((item) => item.id !== post_id);
        if (value === 1) {
          if (action === "like") {
            newGoodsItem[0].likes += 1;
            newGoods.push(newGoodsItem[0]);
          } else {
            newGoodsItem[0].complaints += 1;
            newGoods.push(newGoodsItem[0]);
          }
        } else {
          if (action === "like") {
            newGoodsItem[0].likes -= 1;
            newGoods.push(newGoodsItem[0]);
          } else {
            newGoodsItem[0].complaints -= 1;
            newGoods.push(newGoodsItem[0]);
          }
        }
        set(() => ({
          goods: newGoods,
        }));
      },
    }),
    {
      name: "mainStore",
    }
  )
);

export default useMainStore;
