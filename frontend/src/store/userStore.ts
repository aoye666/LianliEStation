// src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: number;
  nickname: string;
  email: string;
  username: string;
  campus_id: number;
  qq: string;
  credit: number;
  avatar: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  fetchUsers: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
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
      fetchUserProfile: async () => {
        try {
          const res = await axios.get('/api/users/profile', {
            headers: {
              Authorization: `Bearer <JWT_TOKEN>`, // 确保替换<JWT_TOKEN>为实际的token
            },
          });
          set({ currentUser: res.data });
        } catch (error: any) {
          if (error.response && error.response.status === 401) {
            console.error('Token无效');
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
