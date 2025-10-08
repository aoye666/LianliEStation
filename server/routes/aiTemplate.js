import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken"; // 用于生成 JWT
import OpenAI from "openai";
import db from "../db.js";
const { Router, text } = express;

dotenv.config();
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

let router = Router();

// AI调用统计变量
let aiCallStats = {
  totalCalls: 0, // 总调用次数
  todayCalls: 0, // 今日调用次数
  currentDate: new Date().toDateString(), // 当前日期
};

// 敏感词缓存
let sensitiveWordsCache = [];
let cacheTime = 0;

// 检查并重置今日统计
function checkAndResetDaily() {
  const today = new Date().toDateString();
  if (aiCallStats.currentDate !== today) {
    aiCallStats.todayCalls = 0;
    aiCallStats.currentDate = today;
  }
}

// 获取统计数据的函数（供其他模块调用）
export function getAICallStats() {
  checkAndResetDaily();
  return {
    totalCalls: aiCallStats.totalCalls,
    todayCalls: aiCallStats.todayCalls,
    currentDate: aiCallStats.currentDate,
  };
}

// 加载敏感词库
async function loadSensitiveWords() {
  const now = Date.now();
  if (now - cacheTime < 300000 && sensitiveWordsCache.length > 0) {
    return sensitiveWordsCache;
  }
  try {
    const [rows] = await db.query("SELECT word FROM sensitive_words WHERE status = 'active'");
    sensitiveWordsCache = rows.map((r) => r.word);
    cacheTime = now;
  } catch (err) {
    console.error("加载敏感词失败:", err);
  }
  return sensitiveWordsCache;
}

// 敏感词检测(词库+AI)
async function checkSensitive(text) {
  //先用词库快速检测
  const words = await loadSensitiveWords();
  const foundWords = words.filter((word) => text.includes(word));
  if (foundWords.length > 0) {
    return { isSafe: false, reason: "包含敏感词", words: foundWords };
  }

  // 词库未检测到,使用AI深度检测
  const ai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });

  const completion = await ai.chat.completions.create({
    model: "qwen-turbo",
    messages: [
      {
        role: "system",
        content: '你是内容审核助手。检测文本是否包含:政治敏感、色情低俗、暴力血腥、违法犯罪、欺诈信息等。回复JSON: {"isSafe": true/false, "reason": "原因"}',
      },
      { role: "user", content: text },
    ],
  });

  return JSON.parse(completion.choices[0].message.content);
}

router.post("/check-sensitive", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ message: "无效的 Token" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "缺少检测文本" });
    }

    const result = await checkSensitive(text);
    return res.status(200).json(result);
  } catch (error) {
    console.error("敏感词检测错误:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "检测失败" });
  }
});

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
          content: '请根据用户输入生成符合以下结构的商品信息：{ "title": "商品名"(string), "price": 价格(number), "tag": "学习资料" 或 "代办跑腿" 或 "生活用品" 或 "数码电子" 或 "账号会员" 或 "咨询答疑"(string) , "post_type": "sell" 或 "receive"(string), "details": "详情"(string) }',
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    if (completion?.choices?.[0]?.message?.content) {
      // 记录成功调用
      checkAndResetDaily();
      aiCallStats.totalCalls++;
      aiCallStats.todayCalls++;

      const responseData = JSON.parse(completion.choices[0].message.content);
      return res.status(200).json(responseData);
    }

    throw new Error("生成失败");
  } catch (error) {
    console.error("AI 生成错误:", error);
    console.error("req.body:", req.body);

    // 记录失败调用
    checkAndResetDaily();
    aiCallStats.totalCalls++;
    aiCallStats.todayCalls++;

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "无效的 Token" });
    }
    res.status(500).json({ message: "生成商品信息失败" });
  }
});

export default router;
