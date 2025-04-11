import dotenv from "dotenv";
import { Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken"; // 用于生成 JWT
import db from "../db.js";
import upload from "../middlewares/uploadImg.js"; // 引入图片上传中间件

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 提交申诉
router.post("/publish", upload.array("images", 3), async (req, res) => {
  const { id, content, type } = req.body;
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
    const decoded = jwt.verify(token, SECRET_KEY);
    const author_id = decoded.user_id;

    if (!id || !content) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 根据 type 判断是商品申诉还是帖子申诉

    if (type === "goods") {
      // 商品申诉
      const [postCheck] = await db.query("SELECT * FROM goods WHERE id = ?", [id]);
      if (postCheck.length === 0) {
        if (files && files.length) {
          for (const file of files) {
            await fs.promises.unlink(file.path).catch(() => {});
          }
        }
        return res.status(404).json({ message: "商品不存在" });
      }
    } else {
      // 帖子申诉
      const [postCheck] = await db.query("SELECT * FROM posts WHERE id = ?", [id]);
      if (postCheck.length === 0) {
        if (files && files.length) {
          for (const file of files) {
            await fs.promises.unlink(file.path).catch(() => {});
          }
        }
        return res.status(404).json({ message: "帖子不存在" });
      }
    }

    // 插入申诉记录
    const [appealResult] = await db.query("INSERT INTO appeals (author_id, post_id, content, type) VALUES (?, ?, ?, ?)", [author_id, id, content, type]);
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

export default router;
