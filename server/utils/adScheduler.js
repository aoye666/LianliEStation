import cron from "node-cron";
import db from "../db.js";
import fs from "fs";

/**
 * 自动清理过期广告的定时任务
 * 每天凌晨2点执行一次
 */
const scheduleExpiredAdsCleanup = () => {
  // 每天凌晨2点执行
  cron.schedule("0 2 * * *", async () => {
    console.log("开始执行过期广告清理任务...");
    
    try {
      // 首先将过期的广告状态标记为expired
      await db.query(
        "UPDATE advertisements SET status = 'expired' WHERE end_date < NOW() AND status = 'active'"
      );
      
      // 获取所有需要删除的过期广告（状态为expired且过期超过7天的）
      const [expiredAds] = await db.query(`
        SELECT id, image_url FROM advertisements 
        WHERE status = 'expired' 
        AND end_date < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      
      if (expiredAds.length > 0) {
        // 删除过期广告记录
        const adIds = expiredAds.map(ad => ad.id);
        await db.query(
          `DELETE FROM advertisements WHERE id IN (${adIds.map(() => '?').join(',')})`,
          adIds
        );
        
        // 删除相关图片文件
        for (const ad of expiredAds) {
          if (ad.image_url) {
            try {
              await fs.promises.unlink("public" + ad.image_url);
              console.log(`删除图片文件: ${ad.image_url}`);
            } catch (err) {
              console.log(`删除图片文件失败 ${ad.image_url}:`, err.message);
            }
          }
        }
        
        console.log(`过期广告清理完成，共删除 ${expiredAds.length} 条记录`);
      } else {
        console.log("没有找到需要清理的过期广告");
      }
      
    } catch (error) {
      console.error("过期广告清理任务执行失败:", error);
    }
  });
  
  console.log("过期广告清理定时任务已启动 - 每天凌晨2点执行");
};

/**
 * 手动执行过期广告清理
 */
const cleanupExpiredAds = async () => {
  try {
    console.log("手动执行过期广告清理...");
    
    // 标记过期广告
    await db.query(
      "UPDATE advertisements SET status = 'expired' WHERE end_date < NOW() AND status = 'active'"
    );
    
    // 获取并删除过期超过7天的广告
    const [expiredAds] = await db.query(`
      SELECT id, image_url FROM advertisements 
      WHERE status = 'expired' 
      AND end_date < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    if (expiredAds.length > 0) {
      const adIds = expiredAds.map(ad => ad.id);
      await db.query(
        `DELETE FROM advertisements WHERE id IN (${adIds.map(() => '?').join(',')})`,
        adIds
      );
      
      for (const ad of expiredAds) {
        if (ad.image_url) {
          try {
            await fs.promises.unlink("public" + ad.image_url);
          } catch (err) {
            console.log(`删除图片文件失败 ${ad.image_url}:`, err.message);
          }
        }
      }
    }
    
    return expiredAds.length;
  } catch (error) {
    console.error("手动清理过期广告失败:", error);
    throw error;
  }
};

export { scheduleExpiredAdsCleanup, cleanupExpiredAds };