import { Router } from "express";
import db from "../db.js";
import upload from "../middlewares/uploadImg.js";
import { authToken, requireAdmin } from "../middlewares/authToken.js";
import fs from "fs";

const router = Router();

// 获取所有广告列表
router.get("/list", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM advertisements ORDER BY created_at DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取单个广告详情
router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.query("SELECT * FROM advertisements WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "广告不存在" });
    }
    
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 记录广告点击
router.post("/click/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // 增加点击次数
    const [result] = await db.query(
      "UPDATE advertisements SET clicks = clicks + 1 WHERE id = ? AND status = 'active'",
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "广告不存在或已失效" });
    }
    
    res.status(200).json({ message: "点击记录成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 添加广告（仅管理员）
router.post("/add", authToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content, target_url, position, duration } = req.body;
    const imageFile = req.file;
    
    // 验证必填参数
    if (!title || !position) {
      if (imageFile) {
        try {
          await fs.promises.unlink(imageFile.path);
        } catch {}
      }
      return res.status(400).json({ message: "标题和位置为必填项" });
    }
    
    // 验证位置参数
    if (!["banner", "market", "forum"].includes(position)) {
      if (imageFile) {
        try {
          await fs.promises.unlink(imageFile.path);
        } catch {}
      }
      return res.status(400).json({ message: "位置参数无效，必须是 banner, market 或 forum" });
    }
    
    let image_url = null;
    if (imageFile) {
      image_url = "/uploads/" + imageFile.filename;
    }
    
    const [result] = await db.query(
      `INSERT INTO advertisements (title, content, image_url, target_url, position, duration, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [title, content, image_url, target_url, position, duration || 7]
    );
    
    res.status(201).json({ 
      message: "广告创建成功", 
      id: result.insertId 
    });
  } catch (err) {
    console.error(err);
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch {}
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 修改广告（仅管理员）
router.put("/update/:id", authToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target_url, position, duration, status } = req.body;
    const imageFile = req.file;
    
    // 验证广告是否存在
    const [existingAd] = await db.query("SELECT * FROM advertisements WHERE id = ?", [id]);
    if (existingAd.length === 0) {
      if (imageFile) {
        try {
          await fs.promises.unlink(imageFile.path);
        } catch {}
      }
      return res.status(404).json({ message: "广告不存在" });
    }
    
    // 验证位置参数（如果提供）
    if (position && !["banner", "market", "forum"].includes(position)) {
      if (imageFile) {
        try {
          await fs.promises.unlink(imageFile.path);
        } catch {}
      }
      return res.status(400).json({ message: "位置参数无效，必须是 banner, market 或 forum" });
    }
    
    // 验证状态参数（如果提供）
    if (status && !["active", "inactive", "expired"].includes(status)) {
      if (imageFile) {
        try {
          await fs.promises.unlink(imageFile.path);
        } catch {}
      }
      return res.status(400).json({ message: "状态参数无效，必须是 active, inactive 或 expired" });
    }
    
    // 构建更新字段
    const updateFields = [];
    const updateParams = [];
    
    if (title !== undefined) {
      updateFields.push("title = ?");
      updateParams.push(title);
    }
    
    if (content !== undefined) {
      updateFields.push("content = ?");
      updateParams.push(content);
    }
    
    if (target_url !== undefined) {
      updateFields.push("target_url = ?");
      updateParams.push(target_url);
    }
    
    if (position !== undefined) {
      updateFields.push("position = ?");
      updateParams.push(position);
    }
    
    if (duration !== undefined) {
      updateFields.push("duration = ?");
      updateParams.push(duration);
    }
    
    if (status !== undefined) {
      updateFields.push("status = ?");
      updateParams.push(status);
    }
    
    // 处理图片更新
    if (imageFile) {
      // 删除旧图片
      const oldImageUrl = existingAd[0].image_url;
      if (oldImageUrl) {
        try {
          await fs.promises.unlink("public" + oldImageUrl);
        } catch {}
      }
      
      updateFields.push("image_url = ?");
      updateParams.push("/uploads/" + imageFile.filename);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "没有提供要更新的字段" });
    }
    
    updateParams.push(id);
    
    const [result] = await db.query(
      `UPDATE advertisements SET ${updateFields.join(", ")} WHERE id = ?`,
      updateParams
    );
    
    res.status(200).json({ message: "广告更新成功" });
  } catch (err) {
    console.error(err);
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch {}
    }
    res.status(500).json({ message: "服务器错误" });
  }
});

// 删除广告（仅管理员）
router.delete("/delete/:id", authToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取广告信息以删除图片
    const [existingAd] = await db.query("SELECT image_url FROM advertisements WHERE id = ?", [id]);
    if (existingAd.length === 0) {
      return res.status(404).json({ message: "广告不存在" });
    }
    
    // 删除数据库记录
    await db.query("DELETE FROM advertisements WHERE id = ?", [id]);
    
    // 删除图片文件
    const imageUrl = existingAd[0].image_url;
    if (imageUrl) {
      try {
        await fs.promises.unlink("public" + imageUrl);
      } catch (err) {
        console.log("删除图片文件失败:", err.message);
      }
    }
    
    res.status(200).json({ message: "广告删除成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 批量删除过期广告（仅管理员）
router.delete("/cleanup/expired", authToken, requireAdmin, async (req, res) => {
  try {
    // 获取所有过期广告的图片路径
    const [expiredAds] = await db.query(
      "SELECT image_url FROM advertisements WHERE end_date < NOW() OR status = 'expired'"
    );
    
    // 删除过期广告
    const [result] = await db.query(
      "DELETE FROM advertisements WHERE end_date < NOW() OR status = 'expired'"
    );
    
    // 删除相关图片文件
    for (const ad of expiredAds) {
      if (ad.image_url) {
        try {
          await fs.promises.unlink("public" + ad.image_url);
        } catch (err) {
          console.log("删除图片文件失败:", err.message);
        }
      }
    }
    
    res.status(200).json({ 
      message: "过期广告清理完成", 
      deletedCount: result.affectedRows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

// 获取广告统计信息（仅管理员）
router.get("/stats", authToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, title, clicks FROM advertisements ORDER BY clicks DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "服务器错误" });
  }
});

export default router;