import { Router } from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
let router = Router();


router.post("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { user_id, response_type, related_id, content } = req.body;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }
  if (!user_id || !response_type || !related_id || !content) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // 检查是否为管理员（通过 isAdmin 字段判断）
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "只有管理员才能创建回复" });
    }

    // 插入回复记录
    const [result] = await db.query(
      "INSERT INTO responses (user_id, response_type, related_id, content) VALUES (?, ?, ?, ?)",
      [user_id, response_type, related_id, content]
    );
    if (result.insertId) {
      res
        .status(201)
        .json({ message: "回复创建成功", response_id: result.insertId });
    } else {
      res.status(500).json({ message: "回复创建失败" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});


router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;
    const [rows] = await db.query(
      "SELECT * FROM responses WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});


router.put("/:response_id/read", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { response_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }
  if (!response_id) {
    return res.status(400).json({ message: "缺少回复ID" });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user_id;

    // 检查该回复是否属于当前用户
    const [rows] = await db.query(
      "SELECT * FROM responses WHERE id = ? AND user_id = ?",
      [response_id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "回复不存在或不属于当前用户" });
    }

    // 更新 read_status 为 'read'
    await db.query(
      "UPDATE responses SET read_status = 'read' WHERE id = ?",
      [response_id]
    );
    res.status(200).json({ message: "回复已标记为已读" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});



// 查询未读回复（仅限当前用户）
router.get("/unread", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "未提供 Token" });
    }
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const user_id = decoded.user_id;
      const query = "SELECT * FROM responses WHERE user_id = ? AND read_status = 'unread'";
      const [results] = await db.query(query, [user_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("查询未读回复失败:", err);
      res.status(500).json({ message: "查询失败" });
    }
  });
  
  // 查询已读回复（仅限当前用户）
  router.get("/read", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "未提供 Token" });
    }
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const user_id = decoded.user_id;
      const query = "SELECT * FROM responses WHERE user_id = ? AND read_status = 'read'";
      const [results] = await db.query(query, [user_id]);
      res.status(200).json(results);
    } catch (err) {
      console.error("查询已读回复失败:", err);
      res.status(500).json({ message: "查询失败" });
    }
  });
  

export default router;
