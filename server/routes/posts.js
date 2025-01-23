import { Router } from "express";
import db from "../db.js";

let router = Router();

// 获取帖子列表(测试用)
router.get("/", (req, res) => {
  db.query("SELECT * FROM posts WHERE status != 'deleted'") // 排除已删除的帖子
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
  const { author_id, title, content, price, campus_id, post_type, tag } = req.body;

  // 确保必需的字段存在
  if (!author_id || !title || !campus_id || !post_type) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  return db
    .query("INSERT INTO posts (author_id, title, content, price, campus_id, post_type, tag) VALUES (?, ?, ?, ?, ?, ?, ?)", [author_id, title, content, price, campus_id, post_type, tag])
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
  const { post_id } = req.params; // 从 URL 参数中获取 post_id
  const { author_id } = req.body; // 从请求体中获取 author_id（验证用户是否是帖子作者）

  // 确保必需的参数存在
  if (!post_id || !author_id) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 查找帖子并验证用户是否是作者
  db.query("SELECT * FROM posts WHERE id = ? AND author_id = ?", [post_id, author_id])
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
router.get("/byID/:post_id", (req, res) => {
  const { post_id } = req.params; // 从 URL 参数中获取 post_id

  if (!post_id) {
    return res.status(400).json({ message: "缺少帖子 ID" });
  }

  db.query("SELECT id, title, content, author_id, created_at, status, price, campus_id, post_type, tag FROM posts WHERE id = ? AND status != 'deleted'", [post_id]) // 排除已删除的帖子
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或已被删除" });
      }

      res.status(200).json(rows[0]);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 查询帖子（按条件）
router.get("/search", (req, res) => {
  const { title, status, campus_id, post_type, tag, min_price, max_price } = req.query;

  let query = "SELECT * FROM posts WHERE status != 'deleted'"; // 排除已删除的帖子
  let params = [];

  if (title) {
    query += " AND title LIKE ?";
    params.push(`%${title}%`);
  }

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  if (campus_id) {
    query += " AND campus_id = ?";
    params.push(campus_id);
  }

  if (post_type) {
    query += " AND post_type = ?";
    params.push(post_type);
  }

  if (tag) {
    query += " AND tag = ?";
    params.push(tag);
  }

  if (min_price || max_price) {
    if (min_price) {
      query += " AND price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      query += " AND price <= ?";
      params.push(max_price);
    }
  }

  db.query(query, params)
    .then(([rows]) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 修改帖子
router.put("/:post_id", (req, res) => {
  const { post_id } = req.params;
  const { author_id, title, content, price, campus_id, status, post_type, tag } = req.body;

  // 确保必需的字段存在
  if (!author_id || !title || !campus_id || !post_type) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  // 校验价格是否为合法数字
  if (price && isNaN(price)) {
    return res.status(400).json({ message: "价格必须是数字" });
  }

  // 查找帖子并验证用户是否是作者且帖子未被删除
  db.query("SELECT * FROM posts WHERE id = ? AND author_id = ? AND status != 'deleted'", [post_id, author_id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "帖子未找到或用户无权修改" });
      }

      // 更新帖子
      const updateQuery = `
        UPDATE posts
        SET title = ?, content = ?, price = ?, campus_id = ?, status = ?, post_type = ?, tag = ?
        WHERE id = ?`;
      db.query(updateQuery, [title, content, price, campus_id, status, post_type, tag, post_id])
        .then(() => {
          res.status(200).json({ message: "帖子更新成功" });
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

export default router;
