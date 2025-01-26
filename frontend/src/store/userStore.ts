// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: number;
  nickname: string;
  email: string;
  username: string;
  role: string;
  campus_id: number;
  qq_id: string;
  credit: number;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  fetchUsers: () => Promise<void>;
  fetchUserProfile: (username: string) => Promise<void>;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [],
      currentUser: null,
      fetchUsers: async () => {
        try {
          const res = await axios.get('/api/users/');
          set({ users: res.data });
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      },
      fetchUserProfile: async (username: string) => {
        try {
          const res = await axios.post('/api/users/profile', { username });
          set({ currentUser: res.data });
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            console.error('用户不存在');
          } else if (error.response && error.response.status === 500) {
            console.error('服务器错误');
          } else {
            console.error('Error fetching user profile:', error);
          }
        }
      },
    }),
    {
      name: 'user-storage', // 唯一名称
    }
  )
);

export default useUserStore;
