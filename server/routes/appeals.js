import { Router } from "express";
import db from "../db.js";
import jwt from "jsonwebtoken"; // 用于生成 JWT
import dotenv from "dotenv";
import upload from "../middlewares/uploadImg.js"; // 引入图片上传中间件
import fs from "fs";

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
router.post("/publish", upload.array("images", 5), async (req, res) => {
  const { post_id, content } = req.body;
  const files = req.files;
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token

  if (!token) {
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息
    const author_id = decoded.user_id;

    // 确保必需的字段存在
    if (!post_id || !content) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查用户和帖子是否存在
    const [userCheck] = await db.query("SELECT * FROM users WHERE id = ?", [author_id]);
    if (userCheck.length === 0) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ message: "用户不存在" });
    }

    const [postCheck] = await db.query("SELECT * FROM posts WHERE id = ?", [post_id]);
    if (postCheck.length === 0) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ message: "帖子不存在" });
    }

    // 插入申诉记录
    const [appealResult] = await db.query("INSERT INTO appeals (author_id, post_id, content) VALUES (?, ?, ?)", [author_id, post_id, content]);
    const appealId = appealResult.insertId;
    if (!appealId) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(500).json({ message: "申诉插入失败" });
    }

    // 若上传了图片则存储
    let imageUrls = [];
    if (files && files.length) {
      imageUrls = files.map((file) => `/uploads/${file.filename}`);
      const imagePromises = imageUrls.map((url) => db.query("INSERT INTO appeal_images (appeal_id, image_url) VALUES (?, ?)", [appealId, url]));
      await Promise.all(imagePromises);
    }

    res.status(201).json({ message: "申诉提交成功" });
  } catch (err) {
    console.error(err);
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 查询未解决的申诉（仅限当前用户）
router.get("/search/pending", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息
    const user_id = decoded.user_id; // 获取当前用户ID

    // 查询该用户下所有未解决的申诉，并获得图片信息
    const query = `
      SELECT a.*,
             GROUP_CONCAT(ai.image_url) AS image_urls
      FROM appeals AS a
      LEFT JOIN appeal_images AS ai ON a.id = ai.appeal_id
      WHERE a.author_id = ?
        AND a.status != 'deleted'
        AND a.status != 'resolved'
      GROUP BY a.id
    `;
    const [rows] = await db.query(query, [user_id]);

    // 将逗号分隔的图片列表转为数组
    const results = rows.map((row) => {
      return {
        ...row,
        image_urls: row.image_urls ? row.image_urls.split(",") : [],
      };
    });

    res.status(200).json(results);
  } catch (err) {
    console.error("查询失败:", err);
    res.status(500).json({ message: "查询失败" });
  }
});

// 查询已解决的申诉（仅限当前用户）
router.get("/search/resolved", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息
    const user_id = decoded.user_id; // 获取当前用户ID

    // 查询该用户下所有已解决的申诉并包含图片
    const query = `
      SELECT a.*,
             GROUP_CONCAT(ai.image_url) AS image_urls
      FROM appeals AS a
      LEFT JOIN appeal_images AS ai ON a.id = ai.appeal_id
      WHERE a.author_id = ?
        AND a.status = 'resolved'
      GROUP BY a.id
    `;
    const [rows] = await db.query(query, [user_id]);

    // 将逗号分隔的图片列表转为数组
    const results = rows.map((row) => ({
      ...row,
      image_urls: row.image_urls ? row.image_urls.split(",") : [],
    }));
    res.status(200).json(results);
  } catch (err) {
    console.error("查询失败:", err);
    res.status(500).json({ message: "查询失败" });
  }
});

// 查询已撤销的申诉（仅限当前用户）
router.get("/search/deleted", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息
    const user_id = decoded.user_id; // 获取当前用户ID

    // 查询该用户下所有已撤销的申诉
    const query = `
      SELECT a.*,
             GROUP_CONCAT(ai.image_url) AS image_urls
      FROM appeals AS a
      LEFT JOIN appeal_images AS ai ON a.id = ai.appeal_id
      WHERE a.author_id = ?
        AND a.status = 'deleted'
      GROUP BY a.id
    `;
    const [rows] = await db.query(query, [user_id]);

    const results = rows.map((row) => ({
      ...row,
      image_urls: row.image_urls ? row.image_urls.split(",") : [],
    }));

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
