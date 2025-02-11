import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import Cookies from 'js-cookie'; // 使用cookie存储token

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
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
  requestVerification: (email: string) => Promise<void>;
  changePassword: (email: string, verificationCode: string, newPassword: string) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      login: async (identifier: string, password: string) => {
        try {
          const res = await axios.post('http://localhost:5000/api/users/login', { identifier, password });
          const token = res.data.token;
          Cookies.set('auth-token', token, { expires: 7 }); // 存储 token 到 cookie
          set({ isAuthenticated: true, token });
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
          console.log(userData);
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
        set({ isAuthenticated: false, token: null });
      },
      deleteUser: async (username: string) => {
        try {
          const res = await axios.delete('http://localhost:5000/api/users/profile', { data: { username } });
          console.log(res.data.message); // 账户已删除
          Cookies.remove('auth-token'); // 删除用户时移除 cookie
          set({ isAuthenticated: false, token: null });
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
      requestVerification: async (email: string) => {
        try {
          const res = await axios.post('http://localhost:5000/api/users/RequestVerification', { email });
          if (res.status === 200) {
            console.log(res.data.message); // 验证码已发送，请检查您的邮箱
          }
        } catch (error: any) {
          if (error.response && error.response.status === 400) {
            console.error('请提供有效的邮箱地址');
          } else {
            console.error('发送验证码失败，请稍后重试');
          }
        }
      },
      changePassword: async (email: string, verificationCode: string, newPassword: string) => {
        try {
          const res = await axios.put('http://localhost:5000/api/users/change-password', { email, verificationCode, newPassword });
          if (res.status === 200) {
            console.log(res.data.message); // 密码修改成功
          }
        } catch (error: any) {
          if (error.response && error.response.status === 400) {
            console.error('请输入有效的邮箱、验证码和新密码');
          } else if (error.response && error.response.status === 401) {
            console.error('验证码错误或已过期');
          } else {
            console.error('修改密码失败，请稍后重试');
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
