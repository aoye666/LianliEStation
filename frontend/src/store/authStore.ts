import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import Cookies from 'js-cookie'; // 使用cookie存储token

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

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    nickname?: string;
    email: string;
    password: string;
    qq_id: string;
    username: string;
    campus_id: number;
  }) => Promise<void>;
  logout: () => void;
  deleteUser: (username: string) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      currentUser: null,
      login: async (username: string, password: string) => {
        try {
          const res = await axios.post('http://localhost:5000/api/users/login', { username, password });
          const token = res.data.token;
          Cookies.set('auth-token', token, { expires: 7 }); // 存储 token 到 cookie
          set({ isAuthenticated: true, token, currentUser: res.data });
          // 可以在这里设置其他用户信息
        } catch (error: any) {
          if (error.response && error.response.status === 400) {
            console.error('缺少必要参数');
          } else if (error.response && error.response.status === 401) {
            console.error('密码错误');
          } else if (error.response && error.response.status === 404) {
            console.error('用户不存在');
          } else if (error.response && error.response.status === 500) {
            console.error('服务器错误');
          } else {
            console.error('Error logging in:', error);
          }
        }
      },
      register: async (userData: {
        nickname?: string;
        email: string;
        password: string;
        qq_id: string;
        username: string;
        campus_id: number;
      }) => {
        try {
          const res = await axios.post('http://localhost:5000/api/users/register', userData);
          console.log(res.data.message); // 注册成功
        } catch (error: any) {
          if (error.response && error.response.status === 400) {
            console.error(error.response.data.message);
          } else if (error.response && error.response.status === 500) {
            console.error('服务器错误');
          } else {
            console.error('Error registering user:', error);
          }
        }
      },
      logout: () => {
        Cookies.remove('auth-token'); // 登出时移除 cookie
        set({ isAuthenticated: false, token: null, currentUser: null });
      },
      deleteUser: async (username: string) => {
        try {
          const res = await axios.delete('http://localhost:5000/api/users/profile', { data: { username } });
          console.log(res.data.message); // 账户已删除
          Cookies.remove('auth-token'); // 删除用户时移除 cookie
          set({ isAuthenticated: false, token: null, currentUser: null });
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            console.error('用户不存在');
          } else if (error.response && error.response.status === 500) {
            console.error('服务器错误');
          } else {
            console.error('Error deleting user:', error);
          }
        }
      },
    }),
    {
      name: 'auth-storage', // 唯一名称
    }
  )
);

export default useAuthStore;
