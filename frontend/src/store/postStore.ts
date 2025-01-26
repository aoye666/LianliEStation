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
  reviews?: { id: number; user: string; rating: number; comment: string }[];
}

interface Filters {
  searchTerm: string;
  priceRange: [number, number];
  tag: string | null;
  post_type: 'receive' | 'sell';
  campus_id: number;
}

interface PostState {
  posts: Post[];
  filteredPosts: Post[];
  currentPost: Post | null;
  filters: Filters;
  fetchPosts: () => Promise<void>;
  fetchPostDetails: (postId: number) => Promise<void>;
  setPost: (post: Post) => void;
  clearPost: () => void;
  setFilters: (newFilters: Partial<Filters>) => void;
  applyFilters: () => void;
  updatePost: (updatedPost: Post) => void;
}

const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: [],
      filteredPosts: [],
      currentPost: null,
      filters: {
        searchTerm: '',
        priceRange: [0, 10000],
        tag: null,
        post_type: 'receive',
        campus_id: 0,
      },
      fetchPosts: async () => {
        try {
          const res = await axios.get('/posts');
          set((state: PostState) => ({ posts: res.data, filteredPosts: res.data }));
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      },
      fetchPostDetails: async (postId: number) => {
        try {
          const res = await axios.get(`/posts/${postId}`);
          set({ currentPost: res.data });
        } catch (error) {
          console.error('Error fetching post details:', error);
        }
      },
      setPost: (post: Post) => set({ currentPost: post }), // 设置当前帖子
      clearPost: () => set({ currentPost: null }), // 清除当前帖子
      setFilters: (newFilters: Partial<Filters>) => {
        set((state: PostState) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        }));
        // 自动应用筛选条件
        set((state: PostState) => ({
          ...state,
          filteredPosts: state.posts.filter((post: Post) =>
            state.filters.searchTerm.toLowerCase().split(' ').every((term: string) =>
              post.title.toLowerCase().includes(term)
            ) &&
            post.price >= state.filters.priceRange[0] &&
            post.price <= state.filters.priceRange[1] &&
            (state.filters.tag === null || post.tag === state.filters.tag) &&
            post.post_type === state.filters.post_type &&
            post.campus_id === state.filters.campus_id &&
            post.status === 'active' // 确保只显示激活状态的帖子
          ),
        }));
      },
      applyFilters: () => {
        set((state: PostState) => ({
          filteredPosts: state.posts.filter((post: Post) =>
            state.filters.searchTerm.toLowerCase().split(' ').every((term: string) =>
              post.title.toLowerCase().includes(term)
            ) &&
            post.price >= state.filters.priceRange[0] &&
            post.price <= state.filters.priceRange[1] &&
            (state.filters.tag === null || post.tag === state.filters.tag) &&
            post.post_type === state.filters.post_type &&
            post.campus_id === state.filters.campus_id &&
            post.status === 'active' // 确保只显示激活状态的帖子
          ),
        }));
      },
      updatePost: (updatedPost: Post) => {
        set((state: PostState) => ({
          ...state,
          posts: state.posts.map((post: Post) =>
            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
          ),
          filteredPosts: state.filteredPosts.map((post: Post) =>
            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
          ),
          currentPost: state.currentPost?.id === updatedPost.id ? { ...state.currentPost, ...updatedPost } : state.currentPost,
        }));
      },
    }),
    {
      name: 'post-storage', // 唯一名称
    }
  )
);

export default usePostStore;
