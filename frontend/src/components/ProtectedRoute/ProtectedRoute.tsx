// 避免一般用户访问管理员路由
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

  const { isAdmin } = useUserStore();

  if (!isAdmin) {
    return <Navigate to="/pc-page" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
