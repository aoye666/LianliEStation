import React from "react";
import "./App.scss";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAuthStore } from "./store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"; //保护路由，未登录将只能导航至login和register页面
//懒加载不同页面
const Market = React.lazy(() => import("./pages/Market/Market"));
const Post = React.lazy(() => import("./pages/Post/Post"));
const Template = React.lazy(() => import("./pages/Template/Template"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Register = React.lazy(() => import("./pages/Register/Register"));
const Reset = React.lazy(() => import("./pages/Reset/Reset"));
const User = React.lazy(() => import("./pages/User/User"));
const Forum = React.lazy(() => import("./pages/Forum/Forum"));
const Settings = React.lazy(() => import("./pages/Settings/Settings"));
const Stars = React.lazy(() => import("./pages/Stars/Stars"));
const Messages = React.lazy(() => import("./pages/Messages/Messages"));
const History = React.lazy(() => import("./pages/History/History"));

const App: React.FC = () => {
  // 检查是否登录
  const { isAuthenticated } = useAuthStore();

  const router = createBrowserRouter([
    {
      path: "*",
      element: isAuthenticated ? (
        <Navigate to="/user/market" replace />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {  
      path: "/reset/:type",  
      element: <Reset />,  
    },
    {
      path: "/user/market",
      element: (
        <ProtectedRoute>
          <Market />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/forum",
      element: (
        <ProtectedRoute>
          <Forum />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/post",
      element: (
        <ProtectedRoute>
          <Post />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/post/template",
      element: (
        <ProtectedRoute>
          <Template />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/user",
      element: (
        <ProtectedRoute>
          <User />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/stars",
      element: (
        <ProtectedRoute>
          <Stars />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/messages",
      element: (
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/history",
      element: (
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/settings",
      element: (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      ),
    },
  ]);

  return (
    <div className="App">
      <React.Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </React.Suspense>
    </div>
  );
};

export default App;
