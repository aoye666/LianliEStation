// db.js
import { createPool } from "mysql2";

// 加载环境变量
import dotenv from "dotenv";
dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "cy.0604...",
  database: process.env.DB_NAME || "lianli",
});

// 导出 Promise 版本的连接池
export default pool.promise();
