import Navbar from "../../../../components/Navbar/Navbar";
import "./Reset.scss";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../../../../store";
import { useState, useEffect } from "react";
import Forget from "../Forget/Forget";

// 引入 idb
import { openDB } from "idb";

interface Profile {
  nickname: string | undefined;
  campus_id: number | undefined;
  qq_id: string | undefined;
  avatar: File | undefined; // 文件类型
  theme_id: number | undefined;
  background_url: File | undefined;
  banner_url: File | undefined;
}

const dbPromise = openDB('userImagesDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('images')) {
      db.createObjectStore('images');
    }
  },
});

const storeImageInDB = async (key: string, file: File) => {
  const db = await dbPromise;
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  await store.put(file, key);
  await tx.done;
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
  const { currentUser, changeProfile, changeImage } = useUserStore();
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
  const { type } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(profile);
  }, [currentUser]);

  // 处理文件上传变化
  const handleChange =
    (key: keyof Profile) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        key === "avatar" ||
        key === "background_url" ||
        key === "banner_url"
      ) {
        const file = e.target.files?.[0];
        if (file) {
          setProfile((prev) => ({
            ...prev,
            [key]: file,
          }));
        }
      } else {
        const newProfile: Profile = {
          ...defaultProfile,
          [key]:
            key === "campus_id" || key === "theme_id"
              ? Number(e.target.value)
              : e.target.value,
        };
        setProfile(newProfile);
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

  // 处理图片重置默认设置
  const handleResetDefaults = (key: string) => {
  }

  switch (type) {
    case "nickname":
      return (
        <div className="reset-container">
          <Navbar title="重置昵称" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              className="reset-text"
              type="text"
              placeholder="请输入新的昵称"
              onChange={handleChange("nickname")}
            />
            <button className="text-submit" onClick={handleProfileSubmit}>
              保存
            </button>
          </div>
        </div>
      );
    case "campus_id":
      return (
        <div className="reset-container">
          <Navbar title="重置默认校区" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              className="reset-text"
              type="text"
              placeholder="请输入默认校区"
              onChange={handleChange("campus_id")}
            />
            <button className="text-submit" onClick={handleProfileSubmit}>
              保存
            </button>
          </div>
        </div>
      );
    case "qq_id":
      return (
        <div className="reset-container">
          <Navbar title="重置绑定QQ" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              className="reset-text"
              type="text"
              placeholder="请输入要绑定的QQ号"
              onChange={handleChange("qq_id")}
            />
            <button className="text-submit" onClick={handleProfileSubmit}>
              保存
            </button>
          </div>
        </div>
      );
    case "avatar":
      return (
        <div className="reset-container">
          <Navbar title="重置头像" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange("avatar")}
              className="reset-img"
            />
            <button className="text-submit" onClick={handleAvatarSubmit}>
              保存
            </button>
          </div>
        </div>
      );
    case "theme_id":
      return (
        <div className="reset-container">
          <Navbar title="重置主题风格" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              type="text"
              placeholder="请输入主题 ID"
              onChange={handleChange("theme_id")}
              className="reset-text"
            />
            <button className="text-submit" onClick={handleThemeSubmit}>
              保存
            </button>
          </div>
        </div>
      );
    case "background":
      return (
        <div className="reset-container">
          <Navbar title="重置发布页背景" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange("background_url")}
              className="reset-img"
            />
            <button className="text-submit" onClick={handleBackgroundSubmit}>
              保存
            </button>
          </div>
        </div>
      );
    case "banner":
      return (
        <div className="reset-container">
          <Navbar title="重置资料卡背景" backActive={true} backPath="/user/settings" />
          <div className="reset-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange("banner_url")}
              className="reset-img"
            />
            <button className="text-submit" onClick={handleBannerSubmit}>
              保存
            </button>
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