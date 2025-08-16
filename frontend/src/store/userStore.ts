// user、auth、admin 相关的状态管理

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie"; // 使用cookie存储token
import api from "../api/index";
import { message } from "antd";
import { useRecordStore, useMainStore } from "./index";

interface RecordItem {
  targetId: number;
  targetType: string; // "goods" 或 "post"
}

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
  likes: RecordItem[];
  complaints: RecordItem[];
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
  users?: AllUsers[]; // 管理员获取所有用户
  currentUser?: User | null; // 当前用户
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
  updateLikesComplaints: (
    type: string,
    action: string,
    post_id: number,
    value: number
  ) => void;
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
          const res = await api.post("/api/auth/login", {
            identifier,
            password,
          });

          const token = res?.data.token;
          console.log("当前获取的token: ", token);
          if (!token) {
            message.error("未获取到token，请重试");
            return;
          }
          const isAdmin = res?.data.isAdmin;
          Cookies.set("auth-token", token, { expires: 7 });
          set({ isAuthenticated: true, token, isAdmin });

          await get().fetchUserProfile(); // 获取当前用户信息
        } catch (error: any) {
          throw error;
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
          const res = await api.post("/api/auth/register",  userData );
          console.log(res?.data.message); // 注册成功
        } catch (error: any) {
          throw error;
        }
      },

      logout: () => {
        // 清理当前 Store
        set({
          isAuthenticated: false,
          token: null,
          isAdmin: false,
          users: [],
          currentUser: null,
          // searchedUser: null,
        });

        // 清理其他 Store
        useRecordStore.getState().reset();
        useMainStore.getState().reset();

        // 清理 localStorage
        localStorage.removeItem("userStore");
        localStorage.removeItem("recordStore");
        localStorage.removeItem("mainStore");

        // 清理 indexedDB
        // 可选

        // 清理 Cookies
        Cookies.remove("auth-token");

        console.log("全局登出完成");
      },

      deleteUser: async (username: string) => {
        try {
          const res = await api.delete("/api/users/profile", {
            username,
          });
          console.log(res?.data.message); // 账户已删除
          Cookies.remove("auth-token"); // 删除用户时移除 cookie
          set({ isAuthenticated: false, token: null });
        } catch (error: any) {
          throw error;
        }
      },

      requestVerification: async (email: string) => {
        try {
          const res = await api.post("/api/auth/verification", {
            email,
          });
          if (res?.status === 200) {
            console.log(res.data.message); // 验证码已发送，请检查您的邮箱
          }
        } catch (error: any) {
          throw error;
        }
      },

      changePassword: async (
        email: string,
        verificationCode: string,
        newPassword: string
      ) => {
        try {
          const res = await api.put("/api/auth/change-password", {
            email,
            verificationCode,
            newPassword,
          });
          if (res?.status === 200) {
            console.log(res.data.message); // 密码修改成功
          }
        } catch (error: any) {
          throw error;
        }
      },

      // 一般用户获取自己的信息、管理员获取所有用户信息
      fetchUserProfile: async () => {
        try {
          const res = await api.get("/api/users/profile");
          const { isAdmin } = get();

          // 一般用户获取自己的信息
          if (!isAdmin) {
            const userData = res?.data;
            
            if (userData) {
              // 提取 likes 和 complaints
              const { records, ...userInfo } = userData;
              const likes = records?.likes || [];
              const complaints = records?.complaints || [];
              
              // 分别设置用户信息和记录
              set({ 
                currentUser: {
                  ...userInfo,
                  likes,
                  complaints
                }
              });
            }
          }
          // 管理员获取所有用户信息
          else {
            set({ users: res?.data });
          }
        } catch (error: any) {
          throw error;
        }
      },

      // 管理员通过QQ号搜索用户
      // fetchByQQ: async (qq: string) => {
      //   try {
      //     const res = await api.post(
      //       '/api/users/searchByQQ',
      //        {
      //           qq_id: qq,
      //         },
      //     );
      //     set({ searchedUser: res?.data });
      //   } catch (error: any) {
      //     throw error;
      //   }
      // },

      // 上传用户的图片
      changeImage: async (type: string, image: File) => {
        try {
          const formData = new FormData();
          formData.append("image", image);

          const res = await api.put(
            "/api/users/profile/image",
            { formData },
            {
              params: {
                type: type,
              },
            }
          );
          set((state: any) => ({
            currentUser: {
              ...state.currentUser,
              [type === "avatar" ? "avatar" : `${type}_url`]: res?.data.url,
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
          localStorage.removeItem(localStorageKey);

          console.log(res?.data);
        } catch (error: any) {
          throw error;
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

          if (theme_id !== undefined) requestBody.theme_id = theme_id;

          const res = await api.put("/api/users/profile", requestBody);
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
          throw error;
        }
      },

      updateLikesComplaints: (
        type: string,
        action: string,
        post_id: number,
        value: number
      ) => {
        const currentUser = get().currentUser;
        if (currentUser) {
          if (value === 1) {
            if (action === "like") {
              const likes = currentUser.likes;
              likes.push({ targetId: post_id, targetType: type });
              set(
                (state: UserState) =>
                  ({
                    currentUser: {
                      ...state.currentUser,
                      likes,
                    },
                  } as Partial<UserState>)
              );
            } else {
              const complaints = currentUser.complaints;
              complaints.push({ targetId: post_id, targetType: type });
              set(
                (state: UserState) =>
                  ({
                    currentUser: {
                      ...state.currentUser,
                      complaints,
                    },
                  } as Partial<UserState>)
              );
            }
          } else {
            if (action === "like") {
              const likes = currentUser.likes.filter(
                (item) => item.targetId !== post_id || item.targetType !== type
              );
              set(
                (state: UserState) =>
                  ({
                    currentUser: {
                      ...state.currentUser,
                      likes,
                    },
                  } as Partial<UserState>)
              );
            } else {
              const complaints = currentUser.complaints.filter(
                (item) => item.targetId !== post_id || item.targetType !== type
              );
              set(
                (state: UserState) =>
                  ({
                    currentUser: {
                      ...state.currentUser,
                      complaints,
                    },
                  } as Partial<UserState>)
              );
            }
          }
        }
      },

      // // 管理员更新用户信誉分
      // updateCredit: async (qq_id: string, credit: number) => {
      //   try {
      //     const res = await api.put(
      //       '/api/users/searchByQQ',{

      //           qq_id: qq_id,
      //           credit: credit,
      //         }
      //
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
      //     console.log(res?.data);
      //   } catch (error: any) {
      //     throw error;
      //   }
      // },
    }),
    {
      name: "userStore",
    }
  )
);

export default useUserStore;
