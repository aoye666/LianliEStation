import React, { useEffect } from "react";
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
  const { isAuthenticated } = useUserStore();
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
    let cancelled = false;
    const MAX_RETRIES = 5;

    const tryFetchUserProfileAndLikes = async () => {
      let retries = 0;
      while (!cancelled && retries < MAX_RETRIES) {
        try {
          // 并行请求用户信息和点赞/投诉信息
          await Promise.all([
            useUserStore.getState().fetchUserProfile(),
            useUserStore.getState().fetchLikesComplaints(),
          ]);

          // 成功获取用户信息和点赞/投诉信息，退出循环；否则被catch捕获并继续重试直至请求成功或达到最大重试次数
          break;
        } catch (e) {
          console.error("获取用户信息或点赞/投诉信息失败:", e);
        }
        retries++;
        await new Promise((res) => setTimeout(res, 1000));
      }
      if (retries === MAX_RETRIES) {
        alert("获取用户信息或点赞/投诉信息失败，请检查网络或稍后重试。");
      }
    };

    if (token) {
      tryFetchUserProfileAndLikes();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);


// 路由表抽离为常量
const mobileRoutes = [
  {
    path: "*",
    element: useUserStore.getState().isAuthenticated ? (
      <Navigate to="/market" replace />
    ) : (
      <Navigate to="/auth/login" replace />
    ),
  },
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
      <ProtectedRoute>
        <Lazy.ForumDetail />
      </ProtectedRoute>
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
];

const webRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Lazy.Admin />
      </ProtectedRoute>
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
];

const mobileRouter = createBrowserRouter(mobileRoutes);
const webRouter = createBrowserRouter(webRoutes);

  const isMobile = useScreenType(768);

  return (
    <div className="App">
      <React.Suspense fallback={<div>加载中......请稍候......</div>}>
        <RouterProvider router={isMobile ? mobileRouter : webRouter} />
      </React.Suspense>
    </div>
  );
};

export default App;
