import { message } from "antd";
// 商品与帖子的状态管理
import api from "../api/index";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";

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

interface GoodsFilters {
  searchTerm: string | null;
  priceRange: [number, number];
  tag: string | null;
  goods_type: "receive" | "sell" | null;
  campus_id: number | null;
}

interface User {
  id: number;
  nickname: string;
  avatar: string;
}

interface Reply {
  id: number;
  content: string;
  created_at: string;
  user: User;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: User;
  replies: Reply[];
}

interface Post {
  id: number;
  title: string;
  content: string;
  // tag: string;
  author_id: number;
  campus_id: number;
  author_avatar: string;
  author_name: string;
  status: "active" | "inactive" | "deleted";
  likes: number;
  created_at: string;
  images: string[];
  comments: Comment[];
}

interface MainState {
  reset: () => void; // 退出账号时重置状态
  marketPage: number;
  forumPage: number;
  goods: Goods[];
  posts: Post[];
  goodsFilters: GoodsFilters;
  
  // 加载状态
  isMarketLoading: boolean;
  isForumLoading: boolean;
  setMarketLoading: (loading: boolean) => void;
  setForumLoading: (loading: boolean) => void;
  
  clear: () => void;
  fetchGoods: () => Promise<void>;
  setGoodsFilters: (newFilters: Partial<GoodsFilters>) => void;
  updateGoods: () => Promise<void>;
  getForumPosts: () => Promise<void>;
  updateForumPosts: () => Promise<void>;
  publishForumPost: (
    title: string,
    content: string,
    campus_id: number,
    tag?: string,
    images?: File[]
  ) => Promise<boolean>;
  publishMarketGoods: (
    title: string,
    campus_id: number,
    goods_type: string,
    content?: string,
    price?: number,
    tag?: string,
    images?: File[]
  ) => Promise<boolean>;
  updateMarketGoods: (
    goods_id: number,
    title: string,
    campus_id: number,
    goods_type: string,
    status: string,
    content?: string,
    price?: number,
    tag?: string,
    images?: File[]
  ) => Promise<boolean>;
  updateForumPost: (
    post_id: number,
    title: string,
    content: string,
    campus_id: number,
    status: string,
    tag?: string,
    images?: File[]
  ) => Promise<boolean>;
  updateForumInteract: (
    id: number,
    action: string,
    content?: string,
    parent_id?: number,
    value?: number
  ) => Promise<number | undefined>;
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
  updateGoodsItem: (action: string, goods_id: number, value: number) => void;
}

const useMainStore = create<MainState>()(
  persist(
    (set, get) => ({
      marketPage: 1,
      forumPage: 1,
      goods: [],
      posts: [],
      goodsFilters: {
        searchTerm: "",
        goods_type: null,
        tag: "",
        priceRange: [0, 1000000],
        campus_id: null,
      },
      
      // 加载状态初始值
      isMarketLoading: false,
      isForumLoading: false,
      
      // 设置加载状态
      setMarketLoading: (loading) => set({ isMarketLoading: loading }),
      setForumLoading: (loading) => set({ isForumLoading: loading }),

      reset: () => {
        set({
          marketPage: 1,
          forumPage: 1,
          goods: [],
          posts: [],
          goodsFilters: {
            searchTerm: "",
            goods_type: null,
            tag: "",
            priceRange: [0, 1000000],
            campus_id: null,
          },
        });
      },

      getForumPosts: async () => {
        set({ isForumLoading: true }); // 开始加载
        
        try {
          const response = await api.get("/api/forum/posts", {
            params: {
              with_comments: true,
              limit: 16,
            },
          });
          if (response?.status === 200 && response.data) {
            const data = response.data.posts;
            set((state) => ({
              posts: [...data], // 更新 goods 状态
            }));
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
        } finally {
          set({ isForumLoading: false }); // 加载完成
        }
      },

      updateForumPosts: async () => {
        try {
          const response = await api.get("/api/forum/posts", {
            params: {
              with_comments: true,
              limit: 16,
              page: get().forumPage,
            },
          });
          if (response?.status === 200 && response.data.posts.length > 0) {
            const data = response.data.posts;
            set((state) => ({
              posts: [...data], // 更新 goods 状态
              forumPage: state.forumPage + 1,
            }));
            console.log(get().forumPage);
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

      publishForumPost: async (
        title: string,
        content: string,
        campus_id: number,
        tag?: string,
        images?: File[]
      ) => {
        try {
          const formData = new FormData();
          formData.append('title', title);
          formData.append('content', content);
          formData.append('campus_id', campus_id.toString());
          if(tag) formData.append('tag', tag);
          
          // 如果有图片，添加到formData
          if (images && images.length > 0) {
            images.forEach((image) => {
              formData.append('images', image);
            });
          }

          const response = await api.post("/api/publish/posts", formData);

          if (response.status === 200 || response.status === 201) {
            message.success('发布成功');
            return true;
          } else {
            message.error('发布失败，请稍后重试');
            return false;
          }
        } catch (error) {
          console.error('发布失败:', error);
          message.error('发布失败，请稍后重试');
          return false;
        }
      },

      publishMarketGoods: async (
        title: string,
        campus_id: number,
        goods_type: string,
        content?: string,
        price?: number,
        tag?: string,
        images?: File[]
      ) => {
        try {
          const formData = new FormData();
          
          // 必需参数
          formData.append('title', title);
          formData.append('campus_id', campus_id.toString());
          formData.append('goods_type', goods_type);
          
          // 可选参数
          if (content && content.trim() !== '') {
            formData.append('content', content);
          }
          
          if (price !== undefined && price !== null) {
            formData.append('price', price.toString());
          }
          
          if (tag && tag !== '商品类型') {
            formData.append('tag', tag);
          }
          
          // 图片上传（最多3张）
          if (images && images.length > 0) {
            images.forEach((image) => {
              formData.append('images', image);
            });
          }

          const response = await api.post("/api/publish/goods", formData);

          if (response.status === 200 || response.status === 201) {
            message.success('发布成功');
            return true;
          } else {
            message.error('发布失败，请稍后重试');
            return false;
          }
        } catch (error) {
          console.error('发布失败:', error);
          message.error('发布失败，请稍后重试');
          return false;
        }
      },

      updateMarketGoods: async (
        goods_id: number,
        title: string,
        campus_id: number,
        goods_type: string,
        status: string,
        content?: string,
        price?: number,
        tag?: string,
        images?: File[]
      ) => {
        try {
          const formData = new FormData();
          
          // 必需参数
          formData.append('title', title);
          formData.append('campus_id', campus_id.toString());
          formData.append('goods_type', goods_type);
          formData.append('status', status);
          
          // 可选参数
          if (content && content.trim() !== '') {
            formData.append('content', content);
          }
          
          if (price !== undefined && price !== null) {
            formData.append('price', price.toString());
          }
          
          if (tag && tag !== '商品类型') {
            formData.append('tag', tag);
          }
          
          // 图片上传（最多3张）
          if (images && images.length > 0) {
            images.forEach((image) => {
              formData.append('images', image);
            });
          }

          const response = await api.put(`/api/goods/${goods_id}`, formData);

          if (response.status === 200) {
            message.success('修改成功');
            return true;
          } else {
            message.error('修改失败，请稍后重试');
            return false;
          }
        } catch (error) {
          console.error('修改失败:', error);
          message.error('修改失败，请稍后重试');
          return false;
        }
      },

      updateForumPost: async (
        post_id: number,
        title: string,
        content: string,
        campus_id: number,
        status: string,
        tag?: string,
        images?: File[]
      ) => {
        try {
          const formData = new FormData();
          
          // 必需参数
          formData.append('title', title);
          formData.append('content', content);
          formData.append('campus_id', campus_id.toString());
          formData.append('status', status);
          
          // 可选参数
          if (tag && tag !== '帖子标签') {
            formData.append('tag', tag);
          }
          
          // 图片上传（最多9张）
          if (images && images.length > 0) {
            images.forEach((image) => {
              formData.append('images', image);
            });
          }

          const response = await api.put(`/api/forum/posts/${post_id}`, formData);

          if (response.status === 200) {
            message.success('修改成功');
            return true;
          } else {
            message.error('修改失败，请稍后重试');
            return false;
          }
        } catch (error) {
          console.error('修改失败:', error);
          message.error('修改失败，请稍后重试');
          return false;
        }
      },

      updateForumInteract: async (
        id: number,
        action: string,
        content?: string,
        parent_id?: number,
        value?: number
      ) => {
        try {
          const response = await api.post(`api/forum/posts/interact/${id}`, {
            post_id: id,
            action: action,
            content: content ? content : null,
            parent_id: parent_id ? parent_id : null,
            value: value ? value : null,
          });

          // if (response?.status === 200) {
          //   if(action === "like"){
          //     set((state) => ({
          //       forums: state.forums.map((forum) =>
          //         forum.id === id ? { ...forum, like: !forum.like } : forum
          //       ),
          //     }));
          //   }
          // }
          return response.status;
        }
        catch(error){
          console.log(error)
          const err = error as AxiosError;
          if (err.response)
            return err.response.status;
        }
      },

      fetchGoods: async () => {
        set({ isMarketLoading: true }); // 开始加载
        
        try {
          const response = await api.get("/api/goods", {
            page: get().marketPage,
            limit: 12,
            keyword: get().goodsFilters.searchTerm,
            goods_type: get().goodsFilters.goods_type,
            tag: get().goodsFilters.tag,
            min_price: get().goodsFilters.priceRange[0],
            max_price: get().goodsFilters.priceRange[1],
            campus_id: get().goodsFilters.campus_id,
          });

          // console.log(response);
          // 检查返回数据是否有效
          if (response?.status === 200 && response.data) {
            const data = response.data.goods;
            set((state) => ({
              goods: [...data], // 更新 goods 状态
            }));
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
        } finally {
          set({ isMarketLoading: false }); // 加载完成
        }
      },

      clear: () =>
        set(() => ({
          goods: [],
          marketPage: 1,
          goodsFilters: {
            searchTerm: "",
            goods_type: null,
            tag: null,
            priceRange: [0, 1000000],
            campus_id: null,
          },
        })), // 清空所有状态

      clearGoods: () =>
        set(() => ({
          goods: [],
          marketPage: 1,
        })), // 清空 goods 状态

      setGoodsFilters: async (newFilters) => {
        set((state) => ({
          goodsFilters: { ...state.goodsFilters, ...newFilters }, // 更新 filters 状态
        }));
      },

      clearFilters: () =>
        set(() => ({
          goodsFilters: {
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
            params: {
              page: get().marketPage,
              limit: 12,
              keyword: get().goodsFilters.searchTerm,
              goods_type: get().goodsFilters.goods_type,
              tag: get().goodsFilters.tag,
              min_price: get().goodsFilters.priceRange[0],
              max_price: get().goodsFilters.priceRange[1],
              campus_id: get().goodsFilters.campus_id,
            },
          });

          // 检查返回数据是否有效
          if (response?.status === 200 && response.data.goods.length > 0) {
            const data = response.data.goods;
            set((state) => ({
              goods: [...state.goods, ...data], // 更新 posts 状态
              marketPage: state.marketPage + 1,
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
            value: value,
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

          const response = await api.post("/api/appeals/publish", formData);
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

      updateGoodsItem: (action: string, goods_id: number, value: number) => {
        const goods = get().goods;
        const newGoodsItem = goods.filter((item) => item.id === goods_id);
        const newGoods: Goods[] = goods.filter((item) => item.id !== goods_id);
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
