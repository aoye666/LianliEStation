import { Router } from "express";
import db from "../db.js";
import upload from "../middlewares/uploadImg.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";

let router = Router();
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 获取校园墙帖子列表(仅测试，不要在实际项目中使用)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM campus_wall_posts WHERE status != 'deleted'");

    if (rows.length === 0) {
      return res.status(200).json({
        posts: [],
        message: "暂无帖子",
      });
    }

    // 获取所有帖子的图片
    const postIds = rows.map((post) => post.id);
    const [imageRows] = await db.query("SELECT post_id, image_url FROM campus_wall_images WHERE post_id IN (?)", [postIds]);

    // 将图片信息添加到帖子中
    const imagesMap = imageRows.reduce((map, row) => {
      if (!map[row.post_id]) {
        map[row.post_id] = [];
      }
      map[row.post_id].push(row.image_url);
      return map;
    }, {});

    const postsWithImages = rows.map((post) => ({
      ...post,
      images: imagesMap[post.id] || [],
    }));

    res.status(200).json({ posts: postsWithImages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 发布校园墙帖子
router.post("/publish", upload.array("images", 3), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const files = req.files;

  if (!token) {
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    return res.status(401).json({ message: "未提供Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { title, content, campus_id } = req.body;
    const author_id = decoded.user_id;

    // 检查必需参数
    if (!title || !content || !campus_id) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 插入帖子
    const [result] = await db.query("INSERT INTO campus_wall_posts (title, content, author_id, campus_id) VALUES (?, ?, ?, ?)", [title, content, author_id, campus_id]);

    // 处理图片
    if (files && files.length > 0) {
      const imagePromises = files.map((file) => {
        const imageUrl = `/uploads/${file.filename}`;
        return db.query("INSERT INTO campus_wall_images (post_id, image_url) VALUES (?, ?)", [result.insertId, imageUrl]);
      });
      await Promise.all(imagePromises);
    }

    res.status(201).json({ message: "发布成功" });
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

// 删除校园墙帖子(软)
router.delete("/:post_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { post_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const author_id = decoded.user_id;

    // 验证帖子归属权
    const [rows] = await db.query("SELECT * FROM campus_wall_posts WHERE id = ? AND author_id = ?", [post_id, author_id]);

    if (rows.length === 0) {
      return res.status(403).json({ message: "没有权限删除此帖子" });
    }

    // 软删除帖子
    await db.query("UPDATE campus_wall_posts SET status = 'deleted' WHERE id = ?", [post_id]);

    res.status(200).json({ message: "删除成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 完全删除校园墙帖子(管理员)(仅测试)
router.delete("/admin/:post_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { post_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 验证管理员权限
    const isAdmin = decoded.isAdmin;
    if (!isAdmin) {
      return res.status(403).json({ message: "您没有权限完全删除帖子" });
    }

    // 先查询帖子是否存在
    const [postRows] = await db.query("SELECT * FROM campus_wall_posts WHERE id = ?", [post_id]);

    if (postRows.length === 0) {
      return res.status(404).json({ message: "帖子不存在" });
    }

    // 查询帖子关联的所有图片
    const [imageRows] = await db.query("SELECT image_url FROM campus_wall_images WHERE post_id = ?", [post_id]);

    // 删除文件系统中的图片文件
    const deleteImagePromises = imageRows.map(async (image) => {
      const imagePath = `./public${image.image_url}`;
      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`Failed to delete image file: ${imagePath}`, error);
        // 继续执行，不中断流程
      }
    });

    // 等待所有图片文件删除完成
    await Promise.all(deleteImagePromises);

    // 删除数据库中的记录
    await db.query("DELETE FROM campus_wall_images WHERE post_id = ?", [post_id]);
    await db.query("DELETE FROM campus_wall_posts WHERE id = ?", [post_id]);

    res.status(200).json({ message: "删除成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 更新校园墙帖子
router.put("/:post_id", upload.array("images", 3), async (req, res) => {
  const { post_id } = req.params;
  const { title, content, campus_id } = req.body;
  const files = req.files;

  // 获取 token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    return res.status(401).json({ message: "未提供Token" });
  }

  try {
    // 解码 Token 获取用户信息
    const decoded = jwt.verify(token, SECRET_KEY);
    const author_id = decoded.user_id;

    // 确保必需的字段存在
    if (!title || !content || !campus_id) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 查找帖子并验证用户是否是作者且帖子未被删除
    const [rows] = await db.query("SELECT * FROM campus_wall_posts WHERE id = ? AND author_id = ? AND status != 'deleted'", [post_id, author_id]);

    if (rows.length === 0) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ message: "帖子未找到或用户无权修改" });
    }

    // 如果有新图片上传，则删除旧图片
    if (files && files.length) {
      // 查询旧图片
      const [oldImages] = await db.query("SELECT image_url FROM campus_wall_images WHERE post_id = ?", [post_id]);

      // 删除文件系统中的旧图片
      for (const img of oldImages) {
        const oldFilePath = `./public${img.image_url}`;
        await fs.promises.unlink(oldFilePath).catch(() => {});
      }

      // 删除数据库中的旧图片记录
      await db.query("DELETE FROM campus_wall_images WHERE post_id = ?", [post_id]);
    }

    // 更新帖子信息
    await db.query("UPDATE campus_wall_posts SET title = ?, content = ?, campus_id = ? WHERE id = ?", [title, content, campus_id, post_id]);

    // 插入新图片记录
    if (files && files.length) {
      const imagePromises = files.map((file) => {
        const imageUrl = `/uploads/${file.filename}`;
        return db.query("INSERT INTO campus_wall_images (post_id, image_url) VALUES (?, ?)", [post_id, imageUrl]);
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json({ message: "更新成功" });
  } catch (err) {
    console.error(err);
    // 发生错误时删除已上传的新图片
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

export default router;
