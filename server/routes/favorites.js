import { Router } from "express";
import db from "../db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // 用于生成 JWT

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;


// 添加收藏
router.post("/add", (req, res) => {
  const { post_id } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  // 验证 Token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token 无效或已过期" });
    }

    const user_id = decoded.user_id;

    // 确保必需的字段存在
    if (!post_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查帖子是否存在且未删除
    db.query("SELECT * FROM posts WHERE id = ? AND status != 'deleted'", [
      post_id,
    ])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(404).json({ message: "帖子未找到或已被删除" });
        }

        // 检查是否已经收藏过
        db.query(
          "SELECT * FROM user_favorites WHERE user_id = ? AND post_id = ?",
          [user_id, post_id]
        )
          .then(([existingRows]) => {
            if (existingRows.length > 0) {
              return res.status(400).json({ message: "已经收藏过该帖子" });
            }

            // 执行收藏操作
            db.query(
              "INSERT INTO user_favorites (user_id, post_id) VALUES (?, ?)",
              [user_id, post_id]
            )
              .then(() => {
                res.status(201).json({ message: "收藏成功" });
              })
              .catch((err) => {
                console.error(err);
                res.status(500).json({ message: "服务器错误" });
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "服务器错误" });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  });
});

// 取消收藏
router.delete("/remove", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 token" });
  }

  try {
    // 验证 token 并获取 user_id
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;
    const { post_id } = req.body;

    // 确保 post_id 存在
    if (!post_id) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 执行取消收藏操作
    db.query("DELETE FROM user_favorites WHERE user_id = ? AND post_id = ?", [
      user_id,
      post_id,
    ])
      .then((result) => {
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "未找到收藏记录" });
        }

        res.status(200).json({ message: "取消收藏成功" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });
  } catch (err) {
    return res.status(401).json({ message: "无效的 token" });
  }
});

// 查询用户的所有收藏
router.get("/user/favorites", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  // 确保 token 存在
  if (!token) {
    return res.status(401).json({ message: "未提供 token" });
  }

  try {
    // 验证 token 并获取 user_id
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const user_id = decoded.user_id;
    

    // 查询用户收藏的帖子
    db.query(
      `
      SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.status, p.price, p.campus_id, p.post_type, p.tag
      FROM user_favorites uf
      INNER JOIN posts p ON uf.post_id = p.id
      WHERE uf.user_id = ? AND p.status != 'deleted'
    `,
      [user_id]
    )
      .then(([rows]) => {
        res.status(200).json(rows);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "服务器错误" });
      });

  } catch (err) {
    return res.status(401).json({ message: "无效的 token" });
  }
});

export default router;
