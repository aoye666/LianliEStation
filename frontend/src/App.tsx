import React from "react";
import "./App.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuthStore } from "./store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"; //保护路由，未登录将只能导航至login和register页面
import Market from "./pages/Market/Market";
import Post from "./pages/Post/Post";
import Template from "./pages/Template/Template";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import User from "./pages/User/User";
import Forum from "./pages/Forum/Forum";
import Settings from "./pages/Settings/Settings";
import Stars from "./pages/Stars/Stars";
import Messages from "./pages/Messages/Messages";
import History from "./pages/History/History";

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
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
