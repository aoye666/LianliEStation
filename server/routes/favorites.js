
import { Router } from "express";
import db from "../db.js";

let router = Router();

// 添加收藏
router.post("/add", (req, res) => {
  const { user_id, post_id } = req.body;

  // 确保必需的字段存在
  if (!user_id || !post_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 检查帖子是否存在且未删除
  db.query("SELECT * FROM posts WHERE id = ? AND status != 'deleted'", [post_id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或已被删除" });
      }

      // 检查是否已经收藏过
      db.query("SELECT * FROM user_favorites WHERE user_id = ? AND post_id = ?", [user_id, post_id])
        .then(([existingRows]) => {
          if (existingRows.length > 0) {
            return res.status(400).json({ message: "已经收藏过该帖子" });
          }

          // 执行收藏操作
          db.query("INSERT INTO user_favorites (user_id, post_id) VALUES (?, ?)", [user_id, post_id])
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

// 取消收藏
router.delete("/remove", (req, res) => {
  const { user_id, post_id } = req.body;

  // 确保必需的字段存在
  if (!user_id || !post_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 执行取消收藏操作
  db.query("DELETE FROM user_favorites WHERE user_id = ? AND post_id = ?", [user_id, post_id])
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
});

// 查询用户的所有收藏
router.get("/user/:user_id", (req, res) => {
  const { user_id } = req.params;

  // 查询用户收藏的帖子
  db.query(`
    SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.status, p.price, p.campus_id, p.post_type, p.tag
    FROM user_favorites uf
    INNER JOIN posts p ON uf.post_id = p.id
    WHERE uf.user_id = ? AND p.status != 'deleted'
  `, [user_id])
    .then(([rows]) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

export default router;
