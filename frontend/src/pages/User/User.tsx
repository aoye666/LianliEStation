import Tabbar from "../../components/Tabbar/Tabbar";
import "./User.scss";
import { useUserStore } from "../../store";
import { useNavigate } from "react-router-dom";
import stars from "../../assets/favorites-black.svg";
import history from "../../assets/history-black.svg";
import messages from "../../assets/messages-unread.svg";
import settings from "../../assets/settings-black.svg";
import right from "../../assets/right-black.svg";
import avatarDefault from "../../assets/logo.png";
import bannerDefault from "../../assets/background-wide.jpg";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

// 引入 idb  
import { openDB } from "idb";
import { getDBStatus, resetDBStatus } from "../../utils/idbManager";

const createDBConnection = async () => {
  try {
    const db = await openDB('userImagesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      },
    });
    return db;
  } catch (error) {
    console.error('创建数据库连接失败:', error);
    throw error;
  }
};

const storeImageInDB = async (key: string, file: File) => {
  try {
    // 检查数据库状态
    let status = getDBStatus('userImagesDB');
    if (status === 'closed') {
      console.log('数据库状态为 closed，重置为 ready 后重试');
      resetDBStatus('userImagesDB');
      status = 'ready';
    }
    
    if (status === 'closing') {
      console.warn(`数据库正在关闭，跳过存储: ${status}`);
      return;
    }
    
    // 每次都创建新的连接
    const db = await createDBConnection();
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    await store.put(file, key);
    await tx.done;
    
    // 立即关闭连接
    db.close();
    console.log(`成功存储图片: ${key}`);
  } catch (error) {
    console.error('存储图片到 IndexedDB 失败:', error);
  }
};

const getImageFromDB = async (key: string): Promise<File | undefined> => {
  try {
    // 检查数据库状态
    let status = getDBStatus('userImagesDB');
    if (status === 'closed') {
      console.log('数据库状态为 closed，重置为 ready 后重试');
      resetDBStatus('userImagesDB');
      status = 'ready';
    }
    
    if (status === 'closing') {
      console.warn(`数据库正在关闭，跳过缓存读取: ${status}`);
      return undefined;
    }

    // 每次都创建新的连接
    const db = await createDBConnection();
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const file = await store.get(key);
    await tx.done;
    
    // 立即关闭连接
    db.close();
    
    if (file) {
      console.log(`成功读取缓存图片: ${key}`);
    }
    return file;
  } catch (error) {
    console.error('从 IndexedDB 读取图片失败:', error);
    return undefined;
  }
};

const fetchImageAsBase64 = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('获取图片失败:', error);
    return null;
  }
};

const fetchImageFromBackend = async (endpoint: string): Promise<File | null> => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const blob = await response.blob();
    const fileName = endpoint.includes("avatar") ? "avatar.jpg" : "background.jpg";
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('从后端获取图片失败:', error);
    return null;
  }
};

const User = () => {
  const { currentUser, isAuthenticated } = useUserStore();
  const [avatarFile, setAvatarFile] = useState<string | undefined>();
  const [bannerFile, setBannerFile] = useState<string | undefined>();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const loadImage = async (key: string, defaultUrl: string, isAvatar: boolean) => {
    let file = await getImageFromDB(key);
    if (file) {
      // 转成可用的Data URL  
      const base64 = await fetchImageAsBase64(URL.createObjectURL(file));
      console.log("使用indexedDB中缓存的图片")
      return base64 as string;
    } else {
      // 先请求后端  
      const endpoint = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${defaultUrl}`;
      const fetchedFile = await fetchImageFromBackend(endpoint);
      console.log("从后端请求图片")
      if (fetchedFile) {
        // 存入indexedDB  
        await storeImageInDB(key, fetchedFile);
        // 转成Base64  
        const base64 = await fetchImageAsBase64(URL.createObjectURL(fetchedFile));
        return base64 as string;
      } else {
        // 后端也失败，使用默认图片  
        console.log("使用默认图片")
        return isAvatar ? avatarDefault : bannerDefault;
      }
    }
  };

  useEffect(() => {
    // 检查数据库状态，如果是 closed 则重置为 ready
    const dbStatus = getDBStatus('userImagesDB');
    if (dbStatus === 'closed') {
      console.log('检测到数据库状态为 closed，重置为 ready');
      resetDBStatus('userImagesDB');
    }
    
    // 加载头像  
    loadImage(
      "avatar",
      !isAuthenticated
        ? "/uploads/default.png"
        : (currentUser?.avatar || "/uploads/default.png"),
      true
    ).then((base64) => setAvatarFile(base64));

    // 加载背景  
    loadImage(
      "banner",
      !isAuthenticated
        ? "/uploads/default_banner.png"
        : (currentUser?.banner_url || "/uploads/default_banner.png"),
      false
    ).then((base64) => setBannerFile(base64));
  }, [currentUser, token, isAuthenticated]);

  return (
    <div className="user-container">
      <div className="user-bg">
        <img src={bannerFile} alt="用户banner" />
      </div>
      <div className="user-info">
        <div className="user-face">
          <img src={avatarFile} alt="用户头像" />
        </div>
        <div className="user-text">
          <div className="user-name">
            昵称：{currentUser?.nickname || "test"}
          </div>
          <div className="user-credit">
            信誉：{currentUser?.credit || "100"}
          </div>
          <div className="user-email">
            邮箱：{currentUser?.email || "test@test.com"}
          </div>
        </div>
      </div>
      <div className="user-settings">
        <div className="user-item" onClick={() => navigate("/user/favorites")}>
          <img src={stars} alt="收藏" className="item-icon" />
          <div className="item-text">收藏</div>
          <img src={right} alt="右箭头" className="right-icon" />
        </div>
        <div className="user-item" onClick={() => navigate("/user/history")}>
          <img src={history} alt="历史" className="item-icon" />
          <div className="item-text">历史</div>
          <img src={right} alt="右箭头" className="right-icon" />
        </div>
        <div className="user-item" onClick={() => navigate("/user/messages")}>
          <img src={messages} alt="信箱" className="item-icon" />
          <div className="item-text">信箱</div>
          <img src={right} alt="右箭头" className="right-icon" />
        </div>
      </div>
      <div className="user-settings" onClick={() => navigate("/user/settings")}>
        <div className="user-item">
          <img src={settings} alt="设置" className="item-icon" />
          <div className="item-text">设置</div>
          <img src={right} alt="右箭头" className="right-icon" />
        </div>
      </div>
      <Tabbar initialIndex={3} />
    </div>
  );
};

export default User;
