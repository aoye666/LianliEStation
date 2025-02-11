import { Router } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // 用于生成 JWT
import OpenAI from "openai";

dotenv.config();
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

let router = Router();

router.post("/generate", async (req, res) => {
  // 验证 token
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
          content: '请根据用户输入生成符合以下结构的商品信息：{ "title": "商品名"(string), "price": 价格(number), "tag": "学业资料" 或 "跑腿代课" 或 "生活用品" 或 "数码电子" 或 "拼单组队" 或 "捞人询问"(string) , "post_type": "sell" 或 "receive"(string), "details": "详情"(string) }'
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
