import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface Post {
  id: number;
  title: string;
  content: string | null;
  post_type: 'receive' | 'sell';
  tag: string | null;
  author_id: number;
  created_at: string;
  status: 'active' | 'inactive' | 'deleted';
  price: number;
  campus_id: number;
  images:string[];
}

interface Filters {
  searchTerm: string;
  priceRange: [number, number];
  tag: string | null;
  post_type: 'receive' | 'sell';
  campus_id: number;
}

interface PostState {
  page: number;
  posts: Post[];
  stars:Post[];
  filters: Filters;
  fetchPosts: () => Promise<void>;
  setFilters: (newFilters: Partial<Filters>) => void;
  updatePosts:()=>Promise<void>;
  setPage: () => void;
  clearPosts: () => void;
}

const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      page:1,
      stars:[],
      posts: [], // 初始化 posts 为一个空数组
      filters: { searchTerm: '', post_type: 'receive', tag: '', priceRange: [0, 1000000], campus_id: 0 },
      setPage: () => set((preState)=>({
        page: preState.page + 1
      })),
      fetchPosts: async () => {
        const response = await axios.get('http://localhost:5000/api/posts', {
          params: {
            page:get().page,
            limit:18,
        }});
        const data = await response.data;
        set((state)=>({
          posts:[...state.posts,...data]
        })); // 更新 posts 状态
      },

      clearPosts: () => set(() => ({
        posts: [],
        page: 1,
      })), // 清空 posts 状态
      setFilters: async(newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }, // 更新 filters 状态
        }));
      },
      updatePosts: async ()=>{
        const response = await axios.get('http://localhost:5000/api/posts', {
          params: {
            page:get().page,
            limit:18,
            searchTerm: get().filters.searchTerm,
            post_type: get().filters.post_type,
            tag: get().filters.tag,
            priceRange: get().filters.priceRange,
            campus_id: get().filters.campus_id,
          }
        });
        const data = await response.data;
        set((state)=>({
          posts:[...state.posts,...data]
        })); // 更新 posts 状态
      },
      
    }),
    {
      name: 'postStore',
    }
  )
);

export default usePostStore;