import { Router } from "express";
import db from "../db.js";
let router = Router();

// 获取用户列表
router.get("/", (req, res) => {
  db.query("SELECT * FROM users")
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "服务器错误" });
    });
});

export default router;
