import React, { useEffect, useMemo } from "react";
import useScreenType from "./hooks/useScreenType";
import Cookies from "js-cookie";
import "./App.scss";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useUserStore } from "./store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"; //保护路由，未登录将只能导航至login和register页面
import { message } from "antd";

// 懒加载页面组件统一管理
const Lazy = {
  Market: React.lazy(() => import("./pages/Market/Market")),
  Detail: React.lazy(() => import("./pages/Market/Detail/Detail")),
  DetailAppeal: React.lazy(() => import("./pages/Market/Detail/DetailAppeal")),
  MarketPublishChoice: React.lazy(() => import("./pages/Publish/MarketPublish/MarketPublishChoice/MarketPublishChoice")),
  MarketPublish: React.lazy(() => import("./pages/Publish/MarketPublish/MarketPublish")),
  Template: React.lazy(() => import("./pages/Publish/MarketPublish/Template/Template")),
  Login: React.lazy(() => import("./pages/Auth/Login/Login")),
  Register: React.lazy(() => import("./pages/Auth/Register/Register")),
  Reset: React.lazy(() => import("./pages/User/Settings/Reset/Reset")),
  User: React.lazy(() => import("./pages/User/User")),
  Forum: React.lazy(() => import("./pages/Forum/Forum")),
  ForumDisable: React.lazy(() => import("./pages/ForumDisable/Forum")),
  Settings: React.lazy(() => import("./pages/User/Settings/Settings")),
  About: React.lazy(() => import("./pages/User/Settings/About/About")),
  Favorites: React.lazy(() => import("./pages/User/Favorites/Favorites")),
  Messages: React.lazy(() => import("./pages/User/Messages/Messages")),
  History: React.lazy(() => import("./pages/User/History/History")),
  Admin: React.lazy(() => import("./pages/Admin/Admin")),
  ForumPublish: React.lazy(() => import("./pages/Publish/ForumPublish/ForumPublish")),
  ForumDetail: React.lazy(() => import("./pages/Forum/ForumDetail/ForumDetail")),
  Dashboard: React.lazy(() => import("./pages/Admin/Dashboard/Dashboard")),
  AdminMessages: React.lazy(() => import("./pages/Admin/Messages/Messages")),
  AdminMarket: React.lazy(() => import("./pages/Admin/Market/Market")),
  AdminForum: React.lazy(() => import("./pages/Admin/Forum/Forum")),
};

const App: React.FC = () => {
  // 检查是否登录并获取用户信息
  const token = Cookies.get("auth-token");

  // 仅在移动端开启竖屏监控和提示
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const lockOrientation = () => {
      if (window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock("portrait").catch((err) => {
          console.error("锁定竖屏失败:", err);
        });
      }
    };

    const handleOrientationChange = () => {
      if (window.matchMedia("(orientation: landscape)").matches) {
        message.info("请将设备旋转到竖屏模式以获得最佳体验。");
        lockOrientation();
      }
    };

    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    // 初始检测
    handleOrientationChange();

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    // 使用AbortController提供更好的请求取消机制
    const abortController = new AbortController();
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 重试延迟时间

    const fetchUserProfileWithRetry = async () => {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        // 检查是否已被取消
        if (abortController.signal.aborted) {
          console.log("请求已被取消");
          return;
        }

        try {
          console.log(`尝试获取用户信息 (第${attempt + 1}/${MAX_RETRIES}次)`);
          
          // 传递abort信号给请求（如果fetchUserProfile支持的话）
          await useUserStore.getState().fetchUserProfile();
          
          console.log("✅ 用户信息获取成功");
          return; // 成功后退出

        } catch (error) {
          const isLastAttempt = attempt === MAX_RETRIES - 1;
          
          console.error(`❌ 获取用户信息失败 (第${attempt + 1}次):`, error);

          // 如果是网络错误且不是最后一次尝试，继续重试
          if (!isLastAttempt && !abortController.signal.aborted) {
            console.log(`⏳ ${RETRY_DELAY/1000}秒后重试...`);
            
            // 可被中断的延迟
            await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(resolve, RETRY_DELAY);
              abortController.signal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject(new Error('Request aborted'));
              });
            }).catch(() => {
              // 被中断时不做任何处理
              return;
            });
          }
        }
      }

      // 所有重试失败后的处理
      if (!abortController.signal.aborted) {
        console.error("🚫 达到最大重试次数，用户信息获取失败");
        
        // 检查是否是认证问题
        const isAuthError = !useUserStore.getState().currentUser;
        
        if (isAuthError) {
          message.error("登录已过期，请重新登录");
          Cookies.remove("auth-token");
          // 可选：重定向到登录页
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        } else {
          message.warning("获取用户信息失败，请检查网络连接");
        }
      }
    };

    // ✅ 只有存在有效token时才尝试获取
    if (token && token.trim()) {
      fetchUserProfileWithRetry();
    }

    // ✅ 清理函数
    return () => {
      console.log("🧹 清理用户信息获取请求");
      abortController.abort();
    };
  }, [token]);


// 路由表抽离为常量
const mobileRoutes = useMemo(() => [
  
  { path: "/auth/login", element: <Lazy.Login /> },
  { path: "/auth/register", element: <Lazy.Register /> },
  { path: "/user/settings/reset/:type", element: <Lazy.Reset /> },
  {
    path: "/user/settings/about",
    element: (
      <ProtectedRoute>
        <Lazy.About />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market",
    element: (
      <ProtectedRoute>
        <Lazy.Market />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market/:goodsId",
    element: (
      <ProtectedRoute>
        <Lazy.Detail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market/:goodsId/appeal/:goodsTitle",
    element: (
      <ProtectedRoute>
        <Lazy.DetailAppeal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forum",
    element: (
      <ProtectedRoute>
        <Lazy.Forum />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forum-test",
    element: (
      <ProtectedRoute>
        <Lazy.ForumDisable />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forum-detail",
    element: (
      // <ProtectedRoute>
        <Lazy.ForumDetail />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/publish/market-publish-choice",
    element: (
      <ProtectedRoute>
        <Lazy.MarketPublishChoice />
      </ProtectedRoute>
    ),
  },
  {
    path: "/publish/market-publish-ai",
    element: (
      <ProtectedRoute>
        <Lazy.MarketPublish />
      </ProtectedRoute>
    ),
  },
  {
    path: "/publish/forum-publish",
    element: (
      <ProtectedRoute>
        <Lazy.ForumPublish />
      </ProtectedRoute>
    ),
  },
  {
    path: "/publish/market-publish-basic",
    element: (
      <ProtectedRoute>
        <Lazy.Template />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <Lazy.User />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/favorites",
    element: (
      <ProtectedRoute>
        <Lazy.Favorites />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/messages",
    element: (
      <ProtectedRoute>
        <Lazy.Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/history",
    element: (
      <ProtectedRoute>
        <Lazy.History />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/settings",
    element: (
      <ProtectedRoute>
        <Lazy.Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: token ? (
      <Navigate to="/market" replace />
    ) : (
      <Navigate to="/auth/login" replace />
    ),
  },
], [token]);

const webRoutes = useMemo(() => [
  {
    path: "/admin",
    element: (
      <Lazy.Admin />
    ),
    children: [
      {
        index: true,
        element: <Lazy.Dashboard />,
      },
      {
        path: "messages",
        element: <Lazy.AdminMessages />,
      },
      {
        path: "market",
        element: <Lazy.AdminMarket />,
      },
      {
        path: "forum",
        element: <Lazy.AdminForum />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <Navigate to="/admin" replace/>
    ),
  }
], [token]);

  const mobileRouter = useMemo(() => createBrowserRouter(mobileRoutes), [mobileRoutes]);
  const webRouter = useMemo(() => createBrowserRouter(webRoutes), [webRoutes]);

  const isMobile = useScreenType(768);
  console.log(useScreenType(768),isMobile);

  return (
    <div className="App">
      <React.Suspense fallback={<div>加载中......请稍候......</div>}>
        <RouterProvider router={isMobile ? mobileRouter : webRouter} />
      </React.Suspense>
    </div>
  );
};

export default App;
