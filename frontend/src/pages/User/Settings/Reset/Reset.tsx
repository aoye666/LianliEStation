import Navbar from "../../../../components/Navbar/Navbar";
import "./Reset.scss";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../../../../store";
import { useState, useEffect } from "react";
import Forget from "../Forget/Forget";
import { Button, Input, Select } from "antd";
import { UploadOutlined, CameraOutlined } from "@ant-design/icons";
import NoticeLogin from "../../../../components/NoticeLogin/NoticeLogin";

// 引入 idb
import { openDB } from "idb";

interface Profile {
  nickname: string | undefined;
  campus_id: number | undefined;
  qq_id: string | undefined;
  avatar: File | undefined;
  theme_id: number | undefined;
  background_url: File | undefined;
  banner_url: File | undefined;
}

// 创建数据库连接的函数
const createDBConnection = async () => {
  return await openDB('userImagesDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images');
      }
    },
  });
};

const storeImageInDB = async (key: string, file: File) => {
  try {
    const db = await createDBConnection();
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    await store.put(file, key);
    await tx.done;
    db.close(); // 立即关闭连接
  } catch (error) {
    console.error('存储图片到 IndexedDB 失败:', error);
  }
};

// 从indexedDB中获取缓存的图片，此页面暂不需要
// const getImageFromDB = async (key: string): Promise<File | undefined> => {
//   const db = await dbPromise;
//   const tx = db.transaction('images', 'readonly');
//   const store = tx.objectStore('images');
//   const file = await store.get(key);
//   await tx.done;
//   return file;
// };

const Reset = () => {
  const { currentUser, changeProfile, changeImage, isAuthenticated } = useUserStore();
  const defaultProfile: Profile = {
    nickname: currentUser?.nickname || "",
    campus_id: currentUser?.campus_id || 1,
    qq_id: currentUser?.qq || "",
    avatar: undefined,
    theme_id: currentUser?.theme_id,
    background_url: undefined,
    banner_url: undefined,
  };
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const { type } = useParams();
  const navigate = useNavigate();

  // 清理预览URL，防止内存泄露
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, backgroundPreview, bannerPreview]);

  // 处理原生文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background_url' | 'banner_url') => {
    const file = event.target.files?.[0];
    if (file) {
      // 更新profile中的文件
      setProfile((prev) => ({
        ...prev,
        [type]: file,
      }));

      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      
      // 根据类型设置对应的预览
      switch (type) {
        case 'avatar':
          setAvatarPreview(previewUrl);
          break;
        case 'background_url':
          setBackgroundPreview(previewUrl);
          break;
        case 'banner_url':
          setBannerPreview(previewUrl);
          break;
      }
    }
  };

  // 清除图片预览
  const clearPreview = (type: 'avatar' | 'background_url' | 'banner_url') => {
    // 清除profile中的文件
    setProfile((prev) => ({
      ...prev,
      [type]: undefined,
    }));

    // 清除对应的预览
    switch (type) {
      case 'avatar':
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
          setAvatarPreview(null);
        }
        break;
      case 'background_url':
        if (backgroundPreview) {
          URL.revokeObjectURL(backgroundPreview);
          setBackgroundPreview(null);
        }
        break;
      case 'banner_url':
        if (bannerPreview) {
          URL.revokeObjectURL(bannerPreview);
          setBannerPreview(null);
        }
        break;
    }
  };

  // 处理个人信息提交
  const handleProfileSubmit = async () => {
    // 提交个人信息
    changeProfile(
      profile?.nickname || "",
      profile?.campus_id || 1,
      profile?.qq_id || ""
    );
    navigate("/user/settings");
  };

  // 处理图片提交
  const handleImageSubmission = async (key: string, file?: File) => {
    if (file) {
      await storeImageInDB(key, file); // 存储到IndexedDB
      changeImage(key, file); // 调用修改图片的函数
    }
    navigate("/user/settings");
  };

  // 处理资料卡背景提交
  const handleBannerSubmit = () => {
    if (profile?.banner_url) {
      handleImageSubmission("banner", profile.banner_url);
    }
  };

  // 处理发布背景提交
  const handleBackgroundSubmit = () => {
    if (profile?.background_url) {
      handleImageSubmission("background", profile.background_url);
    }
  };

  // 处理头像提交
  const handleAvatarSubmit = () => {
    if (profile?.avatar) {
      handleImageSubmission("avatar", profile.avatar);
    }
  };

  // 处理主题提交
  const handleThemeSubmit = () => {
    changeProfile(
      currentUser?.nickname || "",
      currentUser?.campus_id || 1,
      currentUser?.qq || "",
      profile?.theme_id || 1
    );
    navigate("/user/settings");
  };

  switch (type) {
    case "nickname":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置昵称" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="input-group">
              <Input
                className="modern-input"
                placeholder="请输入新的昵称"
                defaultValue={currentUser?.nickname}
                onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
                size="large"
              />
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleProfileSubmit}
              size="large"
              block
            >
              保存昵称
            </Button>
          </div>
        </div>
      );
    case "campus_id":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置默认校区" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="input-group">
              <Select
                className="modern-select"
                placeholder="请选择默认校区"
                defaultValue={currentUser?.campus_id}
                onChange={(value) => setProfile(prev => ({ ...prev, campus_id: value }))}
                size="large"
                options={[
                  { value: 1, label: '凌水主校区' },
                  { value: 2, label: '开发区校区' },
                  { value: 3, label: '盘锦校区' },
                ]}
              />
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleProfileSubmit}
              size="large"
              block
            >
              保存默认校区
            </Button>
          </div>
        </div>
      );
    case "qq_id":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置绑定QQ" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="input-group">
              <Input
                className="modern-input"
                placeholder="请输入要绑定的QQ号"
                defaultValue={currentUser?.qq}
                onChange={(e) => setProfile(prev => ({ ...prev, qq_id: e.target.value }))}
                size="large"
              />
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleProfileSubmit}
              size="large"
              block
            >
              保存绑定QQ号
            </Button>
          </div>
        </div>
      );
    case "avatar":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置头像" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="upload-group avatar-upload">
              <div className="native-upload-container avatar-shape">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                  style={{ display: 'none' }}
                  id="avatar-upload-input"
                />
                {avatarPreview ? (
                  <div className="preview-container">
                    <img src={avatarPreview} alt="头像预览" className="preview-image" />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => clearPreview('avatar')}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label htmlFor="avatar-upload-input" className="upload-label">
                    <CameraOutlined className="upload-icon" />
                    <div>选择头像</div>
                  </label>
                )}
              </div>
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleAvatarSubmit}
              size="large"
              block
              disabled={!profile?.avatar}
            >
              保存头像
            </Button>
          </div>
        </div>
      );
    case "theme_id":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置主题风格" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="input-group">
              <Select
                className="modern-select"
                placeholder="请选择主题风格"
                defaultValue={currentUser?.theme_id || 1}
                onChange={(value) => setProfile(prev => ({ ...prev, theme_id: value }))}
                size="large"
                options={[
                  { value: 1, label: '默认风格' },
                ]}
              />
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleThemeSubmit}
              size="large"
              block
            >
              保存主题风格
            </Button>
          </div>
        </div>
      );
    case "background":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置发布页背景" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="upload-group background-upload">
              <div className="native-upload-container background-shape">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'background_url')}
                  style={{ display: 'none' }}
                  id="background-upload-input"
                />
                {backgroundPreview ? (
                  <div className="preview-container">
                    <img src={backgroundPreview} alt="背景预览" className="preview-image" />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => clearPreview('background_url')}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label htmlFor="background-upload-input" className="upload-label">
                    <UploadOutlined className="upload-icon" />
                    <div>选择背景</div>
                  </label>
                )}
              </div>
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleBackgroundSubmit}
              size="large"
              block
              disabled={!profile?.background_url}
            >
              保存发布页背景
            </Button>
          </div>
        </div>
      );
    case "banner":
      return (
        <div className="reset-container">
          {!isAuthenticated && <NoticeLogin />}
          <Navbar title="重置资料卡背景" backActive={true} backPath="/user/settings" />
          <div className="reset-content">
            <div className="upload-group banner-upload">
              <div className="native-upload-container banner-shape">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner_url')}
                  style={{ display: 'none' }}
                  id="banner-upload-input"
                />
                {bannerPreview ? (
                  <div className="preview-container">
                    <img src={bannerPreview} alt="Banner预览" className="preview-image" />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => clearPreview('banner_url')}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label htmlFor="banner-upload-input" className="upload-label">
                    <UploadOutlined className="upload-icon" />
                    <div>选择背景</div>
                  </label>
                )}
              </div>
            </div>
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleBannerSubmit}
              size="large"
              block
              disabled={!profile?.banner_url}
            >
              保存资料卡背景
            </Button>
          </div>
        </div>
      );
    case "password":
      return <Forget />;
    default:
      return <Navigate to="/user/settings" replace />;
  }
};

export default Reset;