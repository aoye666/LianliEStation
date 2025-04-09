import dotenv from "dotenv";
import { Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import db from "../db.js";
import upload from "../middlewares/uploadImg.js";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
const API_KEY = process.env.API_KEY;

// 发布商品
router.post("/goods", upload.array("images", 3), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const files = req.files;

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
    const { title, content, price, campus_id, goods_type, tag } = req.body;

    // 检查必需参数（图片为可选参数）
    if (!author_id || !title || !campus_id || !goods_type) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ message: "缺少必要参数" });
    }

    const [result] = await db.query("INSERT INTO goods (author_id, title, content, price, campus_id, goods_type, tag) VALUES (?, ?, ?, ?, ?, ?, ?)", [author_id, title, content, price, campus_id, goods_type, tag]);

    const goodsId = result.insertId;
    if (!goodsId) {
      if (files && files.length) {
        for (const file of files) {
          await fs.promises.unlink(file.path).catch(() => {});
        }
      }
      return res.status(500).json({ message: "商品插入失败，无法获取 postId" });
    }

    let imageUrls = [];
    if (files && Array.isArray(files) && files.length > 0) {
      imageUrls = files.map((file) => `/uploads/${file.filename}`);
      const imagePromises = imageUrls.map((url) => db.query("INSERT INTO goods_images (goods_id, image_url) VALUES (?, ?)", [goodsId, url]));
      await Promise.all(imagePromises);
    }

    // 返回成功信息
    res.status(201).json({ message: "发布成功", image_urls: imageUrls });
  } catch (err) {
    console.error(err);
    if (files && files.length) {
      for (const file of files) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 生成商品模板
router.post("/template", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    // 解码 token
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ message: "无效的 Token" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "缺少生成文本" });
    }

    const ai = new OpenAI({
      apiKey: API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const completion = await ai.chat.completions.create({
      model: "qwen-turbo",
      messages: [
        {
          role: "system",
          content: '请根据用户输入生成符合以下结构的商品信息：{ "title": "商品名"(string), "price": 价格(number), "tag": "学业资料" 或 "跑腿代课" 或 "生活用品" 或 "数码电子" 或 "拼单组队" 或 "捞人询问"(string) , "post_type": "sell" 或 "receive"(string), "details": "详情"(string) }',
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    if (completion?.choices?.[0]?.message?.content) {
      const responseData = JSON.parse(completion.choices[0].message.content);
      return res.status(200).json(responseData);
    }

    throw new Error("生成失败");
  } catch (error) {
    console.error("AI 生成错误:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "生成商品信息失败" });
  }
});

export default router;
