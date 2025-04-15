import dotenv from "dotenv";
import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";
let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 获取通知
router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;

    let promise;

    promise = db.query("SELECT * FROM responses WHERE user_id = ? ORDER BY created_at DESC", [userId]);

    promise
      .then(([rows]) => {
        res.json(rows);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token 无效" });
  }
});

// 修改通知状态
router.put("/status/:message_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { message_id } = req.params;
  const { type, status } = req.body;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!message_id || !type || !status) {
    return res.status(400).json({ message: "缺少必要参数" });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;

    let result;
    if (type === "appeal") {
      // 检查是否是该用户的申诉
      const [appealCheck] = await db.query("SELECT * FROM appeals WHERE id = ? AND author_id = ?", [message_id, userId]);

      if (!appealCheck || appealCheck.length === 0) {
        return res.status(403).json({ message: "无权限修改此通知" });
      }

      [result] = await db.query("UPDATE appeals SET read_status = ? WHERE id = ? AND author_id = ?", [status, message_id, userId]);
    } else if (type === "response") {
      const [responseCheck] = await db.query("SELECT * FROM responses WHERE id = ? AND user_id = ?", [message_id, userId]);

      if (!responseCheck || responseCheck.length === 0) {
        return res.status(403).json({ message: "无权限修改此通知" });
      }

      [result] = await db.query("UPDATE responses SET read_status = ? WHERE id = ? AND user_id = ?", [status, message_id, userId]);
    } else {
      return res.status(400).json({ message: "无效的通知类型" });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "通知状态更新成功" });
    } else {
      return res.status(404).json({ message: "通知不存在或无更新" });
    }
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 无效" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

export default router;
