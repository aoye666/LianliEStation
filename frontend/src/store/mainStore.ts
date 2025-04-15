// 商品与帖子的状态管理

import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

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

interface MainState {
  maxMarketPage: boolean; 
  marketPage: number;
  forumPage: number;
  goods: Goods[];
  posts: Post[];
  filters: Filters;
  clear: () => void;
  fetchGoods: () => Promise<void>;
  setFilters: (newFilters: Partial<Filters>) => void;
  updateGoods: () => Promise<void>;
  setMarketPage: () => void;
  setForumPage: () => void;
  clearGoods: () => void;
  clearFilters: () => void;
}

const useMainStore = create<MainState>()(
  persist(
    (set, get) => ({
      marketPage: 1,
      forumPage: 1,
      goods: [],
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
        if(!get().maxMarketPage){
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
      fetchGoods: async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/goods",
            {
              params: {
                page: get().marketPage,
                limit: 12,
                keyword: get().filters.searchTerm,
                goods_type: get().filters.goods_type,
                tag: get().filters.tag,
                min_price: get().filters.priceRange[0],
                max_price: get().filters.priceRange[1],
                campus_id: get().filters.campus_id,
              },
            }
          );

          // 检查返回数据是否有效
          if (response.status === 200 && response.data) {
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
          const response = await axios.get(
            "http://localhost:5000/api/goods",
            {
              params: {
                page: get().marketPage,
                limit: 12,
                keyword: get().filters.searchTerm,
                goods_type: get().filters.goods_type,
                tag: get().filters.tag,
                min_price: get().filters.priceRange[0],
                max_price: get().filters.priceRange[1],
                campus_id: get().filters.campus_id,
              },
            }
          );

          // 检查返回数据是否有效
          if (response.status === 200 && response.data.goods.length > 0) {
            const data = response.data.goods;
            set((state) => ({
              goods: [...state.goods, ...data], // 更新 posts 状态
              maxMarketPage: false,
            }));
          }
          else if(response.status === 200 && response.data.goods.length === 0){
            console.log("No more goods available");
            set((state) => ({
              maxMarketPage: true,
              marketPage: state.marketPage - 1,
            }));
          }
           else {
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
      name: "mainStore",
    }
  )
);

export default useMainStore;
