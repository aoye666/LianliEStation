// user、auth、admin 相关的状态管理

import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import Cookies from "js-cookie"; // 使用cookie存储token

// 获取token
const token = Cookies.get("auth-token");

// 一般用户
interface User {
  nickname: string;
  username: string;
  campus_id: number;
  qq: string;
  email: string;
  credit: number;
  theme_id: number;
  background_url: string | undefined;
  banner_url: string | undefined;
  avatar: string | undefined;
}

// 管理员获取所有用户
interface AllUsers {
  id: number;
  nickname: string;
  username: string;
  campus_id: number;
  qq: string;
  email: string;
  credit: number;
  theme_id: number;
  background_url: string | undefined;
  banner_url: string | undefined;
  avatar: string | undefined;
}

interface UserState {
  users: AllUsers[]; // 管理员获取所有用户
  currentUser: User | null; // 当前用户
  // searchedUser: QQSearchedUser | null; // 管理员通过QQ号搜索到的用户
  isAuthenticated: boolean;
  token: string | null;
  isAdmin: boolean;

  // fetchByQQ: (qq: string) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  changeImage: (type: string, image: File) => Promise<void>;
  changeProfile: (
    nickname: string,
    campus_id: number,
    qq_id: string,
    theme_id?: number
  ) => Promise<void>;
  // updateCredit: (qq_id: string, credit: number) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: {
    nickname: string;
    email: string;
    password: string;
    qq_id: string;
    username: string;
    campus_id: number;
  }) => Promise<void>;
  logout: () => void;
  deleteUser: (username: string) => Promise<void>;
  requestVerification: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    verificationCode: string,
    newPassword: string
  ) => Promise<void>;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      isAdmin: false,
      users: [],
      currentUser: null,
      // searchedUser: null,
      login: async (identifier: string, password: string) => {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/login", {
            identifier,
            password,
          });
          const token = res.data.token;
          const isAdmin = res.data.isAdmin;
          Cookies.set("auth-token", token, { expires: 7 });
          set({ isAuthenticated: true, token, isAdmin });
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      register: async (userData: {
        nickname: string;
        email: string;
        password: string;
        qq_id: string;
        username: string;
        campus_id: number;
      }) => {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/auth/register",
            userData
          );
          console.log(res.data.message); // 注册成功
        } catch (error: any) {
          console.error(error.response.data.message); // 注册失败
        }
      },
      logout: () => {
        Cookies.remove("auth-token"); // 登出时移除 cookie
        set({ isAuthenticated: false, token: null, currentUser: null, isAdmin: false, users: [] });
        localStorage.clear(); // 登出时清除 localStorage
      },
      deleteUser: async (username: string) => {
        try {
          const res = await axios.delete(
            "http://localhost:5000/api/users/profile",
            { data: { username } }
          );
          console.log(res.data.message); // 账户已删除
          Cookies.remove("auth-token"); // 删除用户时移除 cookie
          set({ isAuthenticated: false, token: null });
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      requestVerification: async (email: string) => {
        try {
          const res = await axios.post(
            "http://localhost:5000/api/auth/verification",
            { email }
          );
          if (res.status === 200) {
            console.log(res.data.message); // 验证码已发送，请检查您的邮箱
          }
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      changePassword: async (
        email: string,
        verificationCode: string,
        newPassword: string
      ) => {
        try {
          const res = await axios.put(
            "http://localhost:5000/api/auth/change-password",
            { email, verificationCode, newPassword }
          );
          if (res.status === 200) {
            console.log(res.data.message); // 密码修改成功
          }
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      // 一般用户获取自己的信息、管理员获取所有用户信息
      fetchUserProfile: async () => {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/users/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const { isAdmin } = get();

          // 一般用户获取自己的信息
          if (!isAdmin) set({ currentUser: res.data });
          // 管理员获取所有用户信息
          else set({ users: res.data });
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      // 管理员通过QQ号搜索用户
      // fetchByQQ: async (qq: string) => {
      //   try {
      //     const res = await axios.post(
      //       "http://localhost:5000/api/users/searchByQQ",
      //       {
      //         params: {
      //           qq_id: qq,
      //         },
      //       },
      //       {
      //         headers: {
      //           Authorization: `Bearer ${token}`,
      //         },
      //       }
      //     );
      //     set({ searchedUser: res.data });
      //   } catch (error: any) {
      //     if (error.response) console.error(error.response.data.message);
      //   }
      // },
      // 上传用户的图片
      changeImage: async (type: string, image: File) => {
        try {
          const formData = new FormData();
          formData.append("image", image);

          const res = await axios.put(
            "http://localhost:5000/api/users/profile/image",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data", // 这行在使用FormData时通常不需要，axios会自动设置
              },
              params: {
                type: type,
              },
            }
          );

          set((state: any) => ({
            currentUser: {
              ...state.currentUser,
              [type === "avatar" ? "avatar" : `${type}_url`]: res.data.url,
            },
          }));

          // 更新 localStorage
          let localStorageKey = "";
          if (type === "background") {
            localStorageKey = "userBackground";
          } else if (type === "banner") {
            localStorageKey = "userBanner";
          } else if (type === "avatar") {
            localStorageKey = "userAvatar";
          }
          localStorage.removeItem(localStorageKey)

          console.log(res.data);
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      // 更新用户的个人信息（图片除外）
      changeProfile: async (
        nickname: string,
        campus_id: number,
        qq_id: string,
        theme_id?: number
      ) => {
        try {
          // 动态构建请求体
          const requestBody: any = {
            nickname,
            campus_id,
            qq_id,
          };

          if (theme_id !== undefined) {
            requestBody.theme_id = theme_id;
          }

          const res = await axios.put(
            "http://localhost:5000/api/users/profile",
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          // 动态更新 currentUser 状态
          set(
            (state: UserState) =>
              ({
                currentUser: {
                  ...state.currentUser,
                  nickname,
                  campus_id,
                  qq_id,
                  ...(theme_id !== undefined ? { theme_id } : {}),
                },
              } as Partial<UserState>)
          );

          console.log(res.data);
        } catch (error: any) {
          if (error.response) console.error(error.response.data.message);
        }
      },
      // // 管理员更新用户信誉分
      // updateCredit: async (qq_id: string, credit: number) => {
      //   try {
      //     const res = await axios.put(
      //       "http://localhost:5000/api/users/searchByQQ",
      //       {
      //         params: {
      //           qq_id: qq_id,
      //           credit: credit,
      //         },
      //       },
      //       {
      //         headers: {
      //           Authorization: `Bearer ${token}`,
      //         },
      //       }
      //     );
      //     set(
      //       (state: UserState) =>
      //         ({
      //           currentUser: {
      //             ...state.currentUser,
      //             credit: credit,
      //           },
      //         } as Partial<UserState>)
      //     );
      //     console.log(res.data);
      //   } catch (error: any) {
      //     if (error.response) console.error(error.response.data.message);
      //   }
      // },
    }),
    {
      name: "userStore",
    }
  )
);

export default useUserStore;
