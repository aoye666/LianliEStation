import dotenv from "dotenv";
import { Router } from "express";
import jwt from "jsonwebtoken"; // 用于解析 JWT
import fs from "fs";
import db from "../db.js";
import { getAICallStats } from "./aiTemplate.js";

let router = Router();

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 根据 qq_id 查询用户信息（仅限管理员）
router.post("/search-user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token
  const { qq_id } = req.body; // 从请求体中获取 qq_id

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!qq_id) {
    return res.status(400).json({ message: "缺少 qq_id 参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 查询指定 qq_id 的用户信息
    const [rows] = await db.query("SELECT id, nickname, email, qq_id, username, credit, campus_id FROM users WHERE qq_id = ?", [qq_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "没有找到匹配的用户" });
    }

    res.status(200).json(rows[0]); // 返回找到的用户信息
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员修改用户信用值 (credit)
router.put("/credit", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取 token
  const { qq_id, credit } = req.body; // 获取 qq_id 和新的 credit 值

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!qq_id || credit === undefined) {
    return res.status(400).json({ message: "缺少必要参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 解码 Token 获取用户信息

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 更新指定 qq_id 用户的 credit 值
    const [result] = await db.query("UPDATE users SET credit = ? WHERE qq_id = ?", [credit, qq_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "没有找到匹配的用户" });
    }

    res.status(200).json({ message: "信用值已更新" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员硬删除帖子
router.delete("/posts/:post_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { post_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 先查询帖子是否存在
    const [postRows] = await db.query("SELECT * FROM posts WHERE id = ?", [post_id]);

    if (postRows.length === 0) {
      return res.status(404).json({ message: "帖子不存在" });
    }

    // 查询帖子关联的所有图片
    const [imageRows] = await db.query("SELECT image_url FROM post_image WHERE post_id = ?", [post_id]);

    // 删除文件系统中的图片文件
    const deleteImagePromises = imageRows.map(async (image) => {
      const imagePath = `./public${image.image_url}`;
      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`删除图片文件失败: ${imagePath}`, error);
        // 继续执行，不中断流程
      }
    });

    // 等待所有图片文件删除完成
    await Promise.all(deleteImagePromises);

    // 删除数据库中的记录
    await db.query("DELETE FROM post_image WHERE post_id = ?", [post_id]);
    await db.query("DELETE FROM posts WHERE id = ?", [post_id]);

    res.status(200).json({ message: "管理员已完全删除帖子" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员硬删除商品
router.delete("/goods/:goods_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { goods_id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 先查询商品是否存在
    const [goodsRows] = await db.query("SELECT * FROM goods WHERE id = ?", [goods_id]);

    if (goodsRows.length === 0) {
      return res.status(404).json({ message: "商品不存在" });
    }

    // 查询商品关联的所有图片
    const [imageRows] = await db.query("SELECT image_url FROM goods_images WHERE goods_id = ?", [goods_id]);

    // 删除文件系统中的图片文件
    const deleteImagePromises = imageRows.map(async (image) => {
      const imagePath = `./public${image.image_url}`;
      try {
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error(`删除图片文件失败: ${imagePath}`, error);
        // 继续执行，不中断流程
      }
    });

    // 等待所有图片文件删除完成
    await Promise.all(deleteImagePromises);

    // 删除数据库中的记录
    await db.query("DELETE FROM goods_images WHERE goods_id = ?", [goods_id]);
    await db.query("DELETE FROM goods WHERE id = ?", [goods_id]);

    res.status(200).json({ message: "管理员已完全删除商品" });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员获取申诉列表
router.get("/appeals", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { status, read_status, type, page = 1, limit = 10 } = req.query;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 构建查询条件
    let whereConditions = "WHERE a.status != 'deleted'";
    const queryParams = [];

    if (status) {
      whereConditions += " AND a.status = ?";
      queryParams.push(status);
    }

    if (read_status) {
      whereConditions += " AND a.read_status = ?";
      queryParams.push(read_status);
    }

    if (type) {
      whereConditions += " AND a.type = ?";
      queryParams.push(type);
    }

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM appeals a
      ${whereConditions}
    `;
    const [countRows] = await db.query(countQuery, queryParams);
    const total = countRows[0].total;

    // 构建主查询
    const mainQuery = `
      SELECT 
        a.*,
        u.nickname as author_name,
        u.qq_id as author_qq_id,
        u.avatar as author_avatar,
        u.credit as author_credit,
        CASE 
          WHEN a.type = 'post' THEN p.title
          WHEN a.type = 'goods' THEN g.title
        END as target_title,
        CASE 
          WHEN a.type = 'post' THEN p.content
          WHEN a.type = 'goods' THEN g.content
        END as target_content
      FROM appeals a
      JOIN users u ON a.author_id = u.id
      LEFT JOIN posts p ON a.type = 'post' AND a.post_id = p.id
      LEFT JOIN goods g ON a.type = 'goods' AND a.post_id = g.id
      ${whereConditions}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryParams.push(parseInt(limit), offset);

    const [appeals] = await db.query(mainQuery, queryParams);

    // 获取申诉的图片
    if (appeals.length > 0) {
      const appealIds = appeals.map(appeal => appeal.id);
      const [imageRows] = await db.query(
        "SELECT appeal_id, image_url FROM appeal_images WHERE appeal_id IN (?)",
        [appealIds]
      );

      // 构建图片映射
      const imagesMap = imageRows.reduce((map, row) => {
        if (!map[row.appeal_id]) {
          map[row.appeal_id] = [];
        }
        map[row.appeal_id].push(row.image_url);
        return map;
      }, {});

      // 为每个申诉添加图片信息
      appeals.forEach(appeal => {
        appeal.images = imagesMap[appeal.id] || [];
      });
    }

    res.status(200).json({
      message: "获取申诉列表成功",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      appeals
    });

  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员更新申诉状态
router.put("/appeals", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { appeal_id, status, read_status, response_content } = req.body;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!appeal_id) {
    return res.status(400).json({ message: "缺少 appeal_id 参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 检查申诉是否存在
    const [appealRows] = await db.query("SELECT * FROM appeals WHERE id = ? AND status != 'deleted'", [appeal_id]);

    if (appealRows.length === 0) {
      return res.status(404).json({ message: "申诉不存在" });
    }

    const appeal = appealRows[0];

    // 构建更新字段
    let updateFields = [];
    let updateParams = [];

    if (status) {
      updateFields.push("status = ?");
      updateParams.push(status);
    }

    if (read_status) {
      updateFields.push("read_status = ?");
      updateParams.push(read_status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "没有提供要更新的字段" });
    }

    updateParams.push(appeal_id);

    // 更新申诉状态
    const updateQuery = `UPDATE appeals SET ${updateFields.join(", ")} WHERE id = ?`;
    await db.query(updateQuery, updateParams);

    // 如果提供了回复内容，插入到 responses 表
    if (response_content && response_content.trim()) {
      await db.query(
        "INSERT INTO responses (title, user_id, response_type, related_id, content) VALUES (?, ?, ?, ?, ?)",
        [`申诉回复：${appeal.title}`, appeal.author_id, 'appeal', appeal_id, response_content.trim()]
      );
    }

    res.status(200).json({ message: "申诉状态更新成功" });

  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});



// 管理员获取用户发布历史
router.get("/search-history", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { user_id, qq_id, type = 'all', status = 'all', page = 1, limit = 20 } = req.query;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  if (!user_id && !qq_id) {
    return res.status(400).json({ message: "缺少 user_id 或 qq_id 参数" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 获取目标用户ID
    let targetUserId = user_id;
    if (!user_id && qq_id) {
      const [userRows] = await db.query("SELECT id FROM users WHERE qq_id = ?", [qq_id]);
      if (userRows.length === 0) {
        return res.status(404).json({ message: "用户不存在" });
      }
      targetUserId = userRows[0].id;
    }

    // 验证目标用户是否存在
    const [targetUserRows] = await db.query(
      "SELECT id, nickname, qq_id, email, credit, campus_id FROM users WHERE id = ?", 
      [targetUserId]
    );

    if (targetUserRows.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    const userInfo = targetUserRows[0];

    // 构建查询条件
    let statusCondition = "";
    if (status !== 'all') {
      statusCondition = `AND status = '${status}'`;
    }

    // 根据类型构建查询
    let queries = [];
    let countQueries = [];

    if (type === 'all' || type === 'posts') {
      queries.push(`
        (SELECT 
          'post' as type,
          id,
          title,
          content,
          status,
          created_at,
          likes,
          complaints,
          campus_id
        FROM posts 
        WHERE author_id = ? ${statusCondition})
      `);
      
      countQueries.push(`
        (SELECT COUNT(*) as count, 'post' as type FROM posts WHERE author_id = ? ${statusCondition})
      `);
    }

    if (type === 'all' || type === 'goods') {
      queries.push(`
        (SELECT 
          'goods' as type,
          id,
          title,
          content,
          status,
          created_at,
          likes,
          complaints,
          campus_id
        FROM goods 
        WHERE author_id = ? ${statusCondition})
      `);
      
      countQueries.push(`
        (SELECT COUNT(*) as count, 'goods' as type FROM goods WHERE author_id = ? ${statusCondition})
      `);
    }

    // 执行统计查询
    const params = queries.length === 2 ? [targetUserId, targetUserId] : [targetUserId];
    
    const countQuery = countQueries.join(' UNION ALL ');
    const [countRows] = await db.query(countQuery, params);

    // 计算统计信息
    let totalPosts = 0, totalGoods = 0;
    countRows.forEach(row => {
      if (row.type === 'post') totalPosts = row.count;
      if (row.type === 'goods') totalGoods = row.count;
    });

    const totalItems = totalPosts + totalGoods;

    // 如果没有数据，直接返回
    if (totalItems === 0) {
      return res.status(200).json({
        message: "查询成功",
        user_info: userInfo,
        statistics: {
          total_items: 0,
          posts: { total: 0 },
          goods: { total: 0 }
        },
        items: [],
        pagination: {
          current_page: parseInt(page),
          total_pages: 0,
          total_items: 0,
          per_page: parseInt(limit)
        }
      });
    }

    // 执行主查询（带分页）
    const mainQuery = `
      ${queries.join(' UNION ALL ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const mainParams = [...params, parseInt(limit), offset];

    const [items] = await db.query(mainQuery, mainParams);

    // 获取关联图片
    if (items.length > 0) {
      const postIds = items.filter(item => item.type === 'post').map(item => item.id);
      const goodsIds = items.filter(item => item.type === 'goods').map(item => item.id);

      let imagesMap = {};

      // 获取帖子图片
      if (postIds.length > 0) {
        const [postImages] = await db.query(
          "SELECT post_id as item_id, image_url FROM post_image WHERE post_id IN (?)",
          [postIds]
        );
        postImages.forEach(img => {
          if (!imagesMap[`post_${img.item_id}`]) {
            imagesMap[`post_${img.item_id}`] = [];
          }
          imagesMap[`post_${img.item_id}`].push(img.image_url);
        });
      }

      // 获取商品图片
      if (goodsIds.length > 0) {
        const [goodsImages] = await db.query(
          "SELECT goods_id as item_id, image_url FROM goods_images WHERE goods_id IN (?)",
          [goodsIds]
        );
        goodsImages.forEach(img => {
          if (!imagesMap[`goods_${img.item_id}`]) {
            imagesMap[`goods_${img.item_id}`] = [];
          }
          imagesMap[`goods_${img.item_id}`].push(img.image_url);
        });
      }

      // 为每个项目添加图片
      items.forEach(item => {
        const key = `${item.type}_${item.id}`;
        item.images = imagesMap[key] || [];
      });
    }

    // 计算详细统计
    const [detailStatsRows] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE author_id = ?) as total_posts,
        (SELECT COUNT(*) FROM posts WHERE author_id = ? AND status = 'active') as active_posts,
        (SELECT COUNT(*) FROM posts WHERE author_id = ? AND status = 'deleted') as deleted_posts,
        (SELECT COUNT(*) FROM goods WHERE author_id = ?) as total_goods,
        (SELECT COUNT(*) FROM goods WHERE author_id = ? AND status = 'active') as active_goods,
        (SELECT COUNT(*) FROM goods WHERE author_id = ? AND status = 'deleted') as deleted_goods,
        (SELECT COALESCE(SUM(likes), 0) FROM posts WHERE author_id = ?) as posts_likes,
        (SELECT COALESCE(SUM(complaints), 0) FROM posts WHERE author_id = ?) as posts_complaints,
        (SELECT COALESCE(SUM(likes), 0) FROM goods WHERE author_id = ?) as goods_likes,
        (SELECT COALESCE(SUM(complaints), 0) FROM goods WHERE author_id = ?) as goods_complaints
    `, [targetUserId, targetUserId, targetUserId, targetUserId, targetUserId, targetUserId, targetUserId, targetUserId, targetUserId, targetUserId]);

    const stats = detailStatsRows[0];

    res.status(200).json({
      message: "查询成功",
      user_info: userInfo,
      statistics: {
        total_items: stats.total_posts + stats.total_goods,
        posts: {
          total: stats.total_posts,
          active: stats.active_posts,
          deleted: stats.deleted_posts,
          total_likes: stats.posts_likes,
          total_complaints: stats.posts_complaints
        },
        goods: {
          total: stats.total_goods,
          active: stats.active_goods,
          deleted: stats.deleted_goods,
          total_likes: stats.goods_likes,
          total_complaints: stats.goods_complaints
        },
        total_likes: stats.posts_likes + stats.goods_likes,
        total_complaints: stats.posts_complaints + stats.goods_complaints
      },
      items,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalItems / parseInt(limit)),
        total_items: totalItems,
        per_page: parseInt(limit)
      }
    });

  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 管理员获取热门搜索关键词
router.get("/search-keywords", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { limit = 50 } = req.query;

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    // 获取热门搜索关键词
    const [keywords] = await db.query(`
      SELECT keyword, search_count, created_at, updated_at
      FROM search_keywords 
      ORDER BY search_count DESC 
      LIMIT ?
    `, [parseInt(limit)]);

    // 获取统计信息
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_keywords,
        SUM(search_count) as total_searches,
        AVG(search_count) as avg_searches_per_keyword,
        MAX(search_count) as max_searches
      FROM search_keywords
    `);

    res.status(200).json({
      message: "获取热门搜索关键词成功",
      statistics: stats[0],
      keywords: keywords
    });

  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    return res.status(500).json({ message: "服务器错误" });
  }
});

// 获取AI调用统计（仅限管理员）
router.get('/ai/stats', (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // 通过 isAdmin 字段判断是否为管理员
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "您没有权限执行此操作" });
    }

    const stats = getAICallStats();
    res.json({
      todayCalls: stats.todayCalls,
      totalCalls: stats.totalCalls
    });
  } catch (error) {
    console.error('获取AI统计数据失败:', error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token 格式无效" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token 已过期" });
    }
    res.status(500).json({ message: '获取统计数据失败' });
  }
});

export default router;
