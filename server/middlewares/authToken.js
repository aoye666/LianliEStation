import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

/**
 * JWT Token 验证中间件
 * 验证请求头中的 Authorization Token，并将解码后的用户信息存储到 req.user
 */
const authToken = (req, res, next) => {
  // 从请求头获取 token
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    // 验证并解码 token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // 将用户信息存储到 req.user，供后续中间件和路由使用
    req.user = decoded;
    
    // 继续执行下一个中间件
    next();
  } catch (error) {
    console.error("Token 验证失败:", error.message);
    return res.status(401).json({ message: "Token 无效" });
  }
};

/**
 * 管理员权限验证中间件
 * 必须先使用 authToken 中间件，然后使用此中间件验证管理员权限
 */
const requireAdmin = (req, res, next) => {
  // 检查用户信息是否存在（应该由 authToken 中间件设置）
  if (!req.user) {
    return res.status(401).json({ message: "未验证的用户" });
  }

  // 检查是否为管理员
  if (req.user.isAdmin !== true) {
    return res.status(403).json({ message: "您没有权限执行此操作" });
  }

  next();
};

export { authToken, requireAdmin };
