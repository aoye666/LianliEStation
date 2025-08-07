import jwt from "jsonwebtoken";
import db from "../db.js";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 检查用户封禁状态的中间件
const checkBanStatus = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.isAdmin) return next();
    const [banRows] = await db.query(
      `SELECT * FROM user_bans WHERE user_id = ? AND status = 'active' AND (ban_until IS NULL OR ban_until > NOW())`,
      [decoded.user_id]
    );
    if (banRows.length > 0) {
      const ban = banRows[0];
      const banMessage = ban.ban_until
        ? `账户已被封禁至 ${new Date(ban.ban_until).toLocaleString('zh-CN')}`
        : '账户已被永久封禁';
      return res.status(403).json({
        message: banMessage,
        reason: ban.reason,
        ban_until: ban.ban_until
      });
    }
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") return next();
    console.error("检查封禁状态时出错:", error);
    return res.status(500).json({ message: "服务器错误" });
  }
};

export default checkBanStatus;
