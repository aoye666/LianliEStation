import { Router } from "express";
import db from "../db.js";
import jwt from "jsonwebtoken"; // 用于生成 JWT
import dotenv from "dotenv";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

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
  const { post_id, content } = req.body;
  const token = req.headers.authorization?.split(" ")[1];  // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息
    const author_id = decoded.user_id;

    // 确保必需的字段存在
    if (!post_id || !content) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查用户和帖子是否存在
    const [userCheck] = await db.query("SELECT * FROM users WHERE id = ?", [author_id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    const [postCheck] = await db.query("SELECT * FROM posts WHERE id = ?", [post_id]);
    if (postCheck.length === 0) {
      return res.status(404).json({ message: "帖子不存在" });
    }

    // 执行插入操作
    await db.query("INSERT INTO appeals (author_id, post_id, content) VALUES (?, ?, ?)", [author_id, post_id, content]);

    res.status(201).json({ message: "申诉提交成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 查询未解决的申诉（仅限当前用户）
router.get("/search/pending", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];  // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);  // 解码 Token 获取用户信息
    const user_id = decoded.user_id;  // 获取当前用户ID

    // 查询该用户下所有未解决的申诉
    let query = "SELECT * FROM appeals WHERE author_id = ? AND status != 'deleted' AND status != 'resolved'"; // 过滤已删除或已解决的申诉
    const params = [user_id]; // 使用 user_id 作为查询条件

    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    console.error("查询失败:", err);
    res.status(500).json({ message: "查询失败" });
  }
});

// 查询已解决的申诉（仅限当前用户）
router.get("/search/resolved", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];  // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);  // 解码 Token 获取用户信息
    const user_id = decoded.user_id;  // 获取当前用户ID

    // 查询该用户下所有已解决的申诉
    let query = "SELECT * FROM appeals WHERE author_id = ? AND status = 'resolved'"; // 查询已解决的申诉
    const params = [user_id]; // 使用 user_id 作为查询条件

    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    console.error("查询失败:", err);
    res.status(500).json({ message: "查询失败" });
  }
});

// 查询已撤销的申诉（仅限当前用户）
router.get("/search/deleted", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];  // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);  // 解码 Token 获取用户信息
    const user_id = decoded.user_id;  // 获取当前用户ID

    // 查询该用户下所有已撤销的申诉
    let query = "SELECT * FROM appeals WHERE author_id = ? AND status = 'deleted'"; // 查询已撤销的申诉
    const params = [user_id]; // 使用 user_id 作为查询条件

    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    console.error("查询失败:", err);
    res.status(500).json({ message: "查询失败" });
  }
});


// 修改申诉状态
router.put("/:appeal_id", (req, res) => {
  const { appeal_id } = req.params;
  const { status } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!status || !appeal_id) {
    return res.status(400).json({ message: "缺少参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;

    // 确认该申诉存在并且是允许修改的
    db.query("SELECT * FROM appeals WHERE id = ?", [appeal_id])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(404).json({ message: "申诉不存在" });
        }

        // 判断当前用户是否为管理员或该申诉的创建者
        if (user_id !== rows[0].author_id) {
          return res.status(403).json({ message: "您没有权限修改该申诉" });
        }

        db.query("UPDATE appeals SET status = ? WHERE id = ?", [status, appeal_id])
          .then(() => {
            res.status(200).json({ message: "申诉状态已更新" });
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
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "无效的 token" });
  }
});

// 删除申诉（软删除）
router.delete("/:appeal_id", (req, res) => {
  const { appeal_id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user_id = decoded.user_id;

    // 确保提供了申诉 ID
    if (!appeal_id) {
      return res.status(400).json({ message: "缺少申诉 ID" });
    }

    // 检查申诉是否存在
    db.query("SELECT * FROM appeals WHERE id = ?", [appeal_id])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(404).json({ message: "申诉不存在" });
        }

        // 判断当前用户是否为管理员或该申诉的创建者
        if (user_id !== rows[0].author_id) {
          return res.status(403).json({ message: "您没有权限删除该申诉" });
        }

        db.query("UPDATE appeals SET status = 'deleted' WHERE id = ?", [appeal_id])
          .then(() => {
            res.status(200).json({ message: "申诉已删除" });
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
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "无效的 token" });
  }
});

export default router;
