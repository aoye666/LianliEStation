// 全局数据库实例映射，用于跟踪打开的连接
const dbInstances = new Map<string, any>();

// 注册数据库实例
export function registerDBInstance(dbName: string, db: any) {
  dbInstances.set(dbName, db);
}

// 注销数据库实例
export function unregisterDBInstance(dbName: string) {
  dbInstances.delete(dbName);
}

// 强制关闭并清除指定名称的 IndexedDB 数据库
export async function clearIDB(dbName: string): Promise<void> {
  if (!window.indexedDB) {
    console.warn("当前环境不支持 IndexedDB");
    return;
  }

  return new Promise((resolve, reject) => {
    // 1. 首先关闭已知的数据库连接
    const existingDB = dbInstances.get(dbName);
    if (existingDB) {
      existingDB.close();
      console.log(`已关闭 ${dbName} 的数据库连接`);
      unregisterDBInstance(dbName);
    }

    // 2. 尝试删除数据库
    const deleteReq = window.indexedDB.deleteDatabase(dbName);
    
    deleteReq.onsuccess = () => {
      console.log(`IndexedDB ${dbName} 已清理`);
      resolve();
    };
    
    deleteReq.onerror = () => {
      console.error(`IndexedDB ${dbName} 清理失败`);
      reject(new Error(`清理 ${dbName} 失败`));
    };
    
    deleteReq.onblocked = () => {
      console.warn(`IndexedDB ${dbName} 清理被阻塞，正在尝试强制刷新...`);
      // 如果被阻塞，稍等片刻后刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };
  });
}