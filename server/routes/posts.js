import { Router } from "express";
import db from "../db.js";

let router = Router();

// 获取帖子列表(测试用)
router.get("/", (req, res) => {
  db.query("SELECT * FROM posts")
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});




// 新增帖子
router.post("/publish", (req, res) => {
  const { user_id, title, content, price, campus_id } = req.body;  // 修改字段名称

  // 确保必需的字段存在
  if (!user_id || !title || !campus_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  return db
    .query(
      "INSERT INTO posts (author_id, title, content, price, campus_id) VALUES (?, ?, ?, ?, ?)",  // 修改字段名为 author_id 和 campus_id
      [user_id, title, content, price, campus_id]
    )
    .then(() => {
      res.status(201).json({ message: "发布成功" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});


// 删除帖子
router.delete("/:post_id", (req, res) => {
  const { post_id } = req.params;  // 从 URL 参数中获取 post_id
  const { user_id } = req.body;    // 从请求体中获取 user_id（验证用户是否是帖子作者）

  // 确保必需的参数存在
  if (!post_id || !user_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 查找帖子并验证用户是否是作者
  db.query("SELECT * FROM posts WHERE id = ? AND author_id = ?", [post_id, user_id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或用户无权删除" });
      }

      // 软删除：将 status 字段设置为 'deleted'
      db.query("UPDATE posts SET status = 'deleted' WHERE id = ?", [post_id])
        .then(() => {
          res.status(200).json({ message: "帖子已标记为删除" });
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

// 获取帖子详情

// 查询帖子（按条件）

export default router;
