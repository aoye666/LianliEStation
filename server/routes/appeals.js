import { Router } from "express";
import db from "../db.js";

let router = Router();

// 获取所有申诉
router.get("/", (req, res) => {
  db.query("SELECT * FROM appeals WHERE status != 'deleted'") // 过滤已删除
    .then(([rows]) => {
      res.json(rows); // 返回申诉列表
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 提交申诉
router.post("/publish", async (req, res) => {
  try {
    const { author_id, post_id, content } = req.body;

    // 参数基础校验
    if (!author_id || !post_id || !content) {
      return res.status(400).json({ message: "缺少参数" });
    }

    // 顺序执行检查
    const userCheck = await db.query("SELECT * FROM users WHERE id = ?", [author_id]);
    if (userCheck[0].length === 0) {
      return res.status(404).json({ message: "用户不存在" }); // 立即返回
    }

    const postCheck = await db.query("SELECT * FROM posts WHERE id = ?", [post_id]);
    if (postCheck[0].length === 0) {
      return res.status(404).json({ message: "帖子不存在" }); // 立即返回
    }

    // 执行插入操作
    await db.query("INSERT INTO appeals (author_id, post_id, content) VALUES (?, ?, ?)", [author_id, post_id, content]);

    res.status(201).json({ message: "提交成功" });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      // 防御性判断
      res.status(500).json({ message: "服务器错误" });
    }
  }
});

// 查询申诉（按条件）
router.get("/search", async (req, res) => {
  try {
    const { author_id, post_id, status } = req.query;

    let query = "SELECT * FROM appeals WHERE 1=1";
    const params = [];

    // 动态构建查询条件
    if (author_id) {
      query += " AND author_id = ?";
      params.push(author_id);
    }
    if (post_id) {
      query += " AND post_id = ?";
      params.push(post_id);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    } else {
      query += " AND status != 'deleted'"; // 默认过滤已删除
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error("搜索失败:", err);
    res.status(500).json({ message: "查询失败" });
  }
});

// 修改申诉状态
router.put("/:appeal_id", (req, res) => {
  const { appeal_id } = req.params;
  const { status } = req.body;

  // 检查参数
  if (!appeal_id || !status) {
    return res.status(400).json({ message: "缺少参数" });
  }

  // 检查申诉是否存在
  db.query("SELECT * FROM appeals WHERE id = ?", [appeal_id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: "申诉不存在" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });

  db.query("UPDATE appeals SET status = ? WHERE id = ?", [status, appeal_id])
    .then(() => {
      res.json({ message: "修改成功" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 删除申诉（软删除）
router.delete("/:appeal_id", (req, res) => {
  const { appeal_id } = req.params;

  // 检查参数
  if (!appeal_id) {
    return res.status(400).json({ message: "缺少参数" });
  }

  //
  db.query("UPDATE appeals SET status = 'deleted' WHERE id = ?", [appeal_id])
    .then(() => {
      res.json({ message: "删除成功" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

export default router;
