import { Router } from "express";
import db from "../db.js";

let router = Router();

// 获取帖子列表(测试用)
router.get("/", (req, res) => {
  db.query("SELECT * FROM posts")
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

// 新增帖子
router.post("/publish", (req, res) => {
  const { user_id, title, content, price, campus } = req.body;

  return db
    .query("INSERT INTO posts (user_id, title, content, price, campus) VALUES (?, ?, ?, ?, ?)", [
      user_id,
      title,
      content,
      price,
      campus,
    ])
    .then(() => {
      res.status(201).json({ message: "发布成功" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});
// 删去帖子

// 获取帖子详情

// 查询帖子（按条件）

export default router;
