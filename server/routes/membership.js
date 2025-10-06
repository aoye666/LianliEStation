import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";
import dotenv from "dotenv";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 购买会员
router.post("/purchase", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { type = 'basic', duration = 30 } = req.body;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;

    // 验证会员类型
    const validTypes = ['basic', 'premium', 'vip'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "无效的会员类型" });
    }

    // 验证购买时长
    if (!duration || duration <= 0 || duration > 365) {
      return res.status(400).json({ message: "购买时长必须在1-365天之间" });
    }

    // 检查用户是否存在
    const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [user_id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 开启事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 插入会员记录
      const [result] = await connection.query(
        "INSERT INTO memberships (uid, type, duration) VALUES (?, ?, ?)",
        [user_id, type, duration]
      );

      const membershipId = result.insertId;

      // 记录会员开通事件
      await connection.query(
        "INSERT INTO record_event (info, type) VALUES (?, 'membership')",
        [user_id.toString()]
      );

      // 提交事务
      await connection.commit();
      connection.release();

      res.status(201).json({
        message: "会员购买成功",
        membership: {
          id: membershipId,
          type: type,
          duration: duration,
          user_id: user_id
        }
      });

    } catch (transactionErr) {
      // 回滚事务
      await connection.rollback();
      connection.release();
      throw transactionErr;
    }

  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

export default router;