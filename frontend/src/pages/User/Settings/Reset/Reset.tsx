import Navbar from "../../../../components/Navbar/Navbar";
import "./Reset.scss";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../../../../store";
import { useState, useEffect } from "react";
import Forget from "../Forget/Forget";

interface Profile {
  nickname: string | undefined;
  campus_id: number | undefined;
  qq_id: string | undefined;
  avatar: File | undefined; // 修改为 File 类型
  theme_id: number | undefined;
  background_url: File | undefined; // 修改为 File 类型
  banner_url: File | undefined; // 修改为 File 类型
} // 其中主题中的三张图片是指当前临时图片，类型为 File 而不是 string ，不从 userTheme 中调用

const Reset = () => {
  const {
    currentUser,
    changeProfile,
    changeImage
  } = useUserStore();
  const defaultProfile: Profile = {
    nickname: currentUser?.nickname || "",
    campus_id: currentUser?.campus_id || 1,
    qq_id: currentUser?.qq || "",
    avatar: undefined, // file类型
    theme_id: currentUser?.theme_id,
    background_url: undefined, // file类型
    banner_url: undefined, // file类型
  };
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const { type } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    console.log(profile)
  }, [currentUser]);

  const handleChange =
    (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        key === "avatar" ||
        key === "background_url" ||
        key === "banner_url"
      ) {
        const file = e.target.files?.[0]; // 获取文件对象
        setProfile((prevProfile) => ({
          ...prevProfile,
          [key]: file,
        }));
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

  // 设置个人信息（非图片）
  const handleProfileSubmit = async () => {
    changeProfile(
      profile?.nickname || "",
      profile?.campus_id || 1,
      profile?.qq_id || ""
    );
    navigate("/user/settings");
  };

  // 设置图片
  const handleBannerSubmit = () => {
    if (profile?.banner_url) {
      changeImage("banner", profile.banner_url); // 传递文件对象
    }
    navigate("/user/settings");
  };
  const handleBackgroundSubmit = () => {
    if (profile?.background_url) {
      changeImage("background", profile.background_url); // 传递文件对象
    }
    navigate("/user/settings");
  };
  const handleAvatarSubmit = () => {
    if (profile?.avatar) {
      changeImage("avatar", profile.avatar); // 传递文件对象
    }
    navigate("/user/settings");
  };

  // 设置主题
  const handleThemeSubmit = () => {
    changeProfile(currentUser?.nickname || "", currentUser?.campus_id || 1, currentUser?.qq || "", profile?.theme_id || 1);
    navigate("/user/settings");
  };

  switch (type) {
    case "nickname":
      return (
        <div className="reset-container">
          <Navbar title="重置昵称" backActive={true} backPath="/user/settings" />
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
      );
    case "campus_id":
      return (
        <div className="reset-container">
          <Navbar title="重置默认校区" backActive={true} backPath="/user/settings" />
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
      );
    case "qq_id":
      return (
        <div className="reset-container">
          <Navbar title="重置绑定QQ" backActive={true} backPath="/user/settings" />
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
      );
    case "avatar":
      return (
        <div className="reset-container">
          <Navbar title="重置头像" backActive={true} backPath="/user/settings" />
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
      );
    case "theme_id":
      return (
        <div className="reset-container">
          <Navbar title="重置主题风格" backActive={true} backPath="/user/settings" />
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
      );
    case "background":
      return (
        <div className="reset-container">
          <Navbar
            title="重置发布页背景"
            backActive={true}
            backPath="/user/settings"
          />
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
      );
    case "banner":
      return (
        <div className="reset-container">
          <Navbar
            title="重置资料卡背景"
            backActive={true}
            backPath="/user/settings"
          />
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
      );
    case "password":
      return <Forget />;
    default:
      return <Navigate to="/user/settings" replace />;
  }
};

export default Reset;
