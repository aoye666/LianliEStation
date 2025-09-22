/**
 * IndexedDB 管理工具
 * 功能：数据库状态跟踪、安全清理
 */

// 数据库状态映射，跟踪数据库是否正在关闭
const dbStatus = new Map<string, 'ready' | 'closing' | 'closed'>();

// 设置数据库状态
export function setDBStatus(dbName: string, status: 'ready' | 'closing' | 'closed') {
  dbStatus.set(dbName, status);
  console.log(`数据库状态更新: ${dbName} -> ${status}`);
}

// 检查数据库状态
export function getDBStatus(dbName: string) {
  return dbStatus.get(dbName) || 'ready'; // 默认为 ready
}

// 重置数据库状态为 ready
export function resetDBStatus(dbName: string) {
  dbStatus.set(dbName, 'ready');
  console.log(`数据库状态已重置: ${dbName} -> ready`);
}

// 强制清除指定名称的 IndexedDB 数据库
export async function clearIDB(dbName: string): Promise<void> {
  if (!window.indexedDB) {
    console.warn("当前环境不支持 IndexedDB");
    return;
  }

  return new Promise((resolve, reject) => {
    // 1. 设置数据库状态为关闭中
    setDBStatus(dbName, 'closing');

    // 2. 稍等一下确保没有正在进行的操作
    setTimeout(() => {
      // 3. 尝试删除数据库
      const deleteReq = window.indexedDB.deleteDatabase(dbName);
      
      deleteReq.onsuccess = () => {
        console.log(`IndexedDB ${dbName} 已清理`);
        setDBStatus(dbName, 'closed');
        // 1秒后自动重置状态，允许后续操作
        setTimeout(() => {
          resetDBStatus(dbName);
        }, 1000);
        resolve();
      };
      
      deleteReq.onerror = () => {
        console.error(`IndexedDB ${dbName} 清理失败`);
        setDBStatus(dbName, 'ready'); // 恢复状态
        reject(new Error(`清理 ${dbName} 失败`));
      };
      
      deleteReq.onblocked = () => {
        console.warn(`IndexedDB ${dbName} 清理被阻塞，正在尝试强制刷新...`);
        // 如果被阻塞，稍等片刻后刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      };
    }, 200); // 等待200ms确保没有正在进行的操作
  });
}