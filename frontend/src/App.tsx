import React from "react";
import "./App.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuthStore } from "./store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"; //保护路由，未登录将只能导航至login和register页面
//懒加载不同页面
const Market = React.lazy(() => import("./pages/Market/Market"));
const Post = React.lazy(() => import("./pages/Post/Post"));
const Template = React.lazy(() => import("./pages/Template/Template"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Register = React.lazy(() => import("./pages/Register/Register"));
const User = React.lazy(() => import("./pages/User/User"));
const Forum = React.lazy(() => import("./pages/Forum/Forum"));
const Settings = React.lazy(() => import("./pages/Settings/Settings"));
const Stars = React.lazy(() => import("./pages/Stars/Stars"));
const Messages = React.lazy(() => import("./pages/Messages/Messages"));
const History = React.lazy(() => import("./pages/History/History"));

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // 测试阶段可以注释掉保护路由
  const router = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? (
        <ProtectedRoute>
          <Market />
        </ProtectedRoute>
      ) : (
        <Login />
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
      path: "/market",
      element: (
        //<ProtectedRoute>
          <Market />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/forum",
      element: (
        //<ProtectedRoute>
          <Forum />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/post",
      element: (
        //<ProtectedRoute>
          <Post />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/template",
      element: (
        //<ProtectedRoute>
          <Template />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/user",
      element: (
        // <ProtectedRoute>
          <User />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/stars",
      element: (
        // <ProtectedRoute>
          <Stars />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/messages",
      element: (
        // <ProtectedRoute>
          <Messages />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/history",
      element: (
        // <ProtectedRoute>
          <History />
        //</ProtectedRoute>
      ),
    },
    {
      path: "/settings",
      element: (
        // <ProtectedRoute>
          <Settings />
        //</ProtectedRoute>
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
