import Tabbar from "../../components/Tabbar/Tabbar";
import "./User.scss";
import { useUserStore } from "../../store";
import { useNavigate } from "react-router-dom";
import stars from "../../assets/favorites.svg";
import history from "../../assets/history.svg";
import messages from "../../assets/messages.svg";
import settings from "../../assets/settings.svg";
import right from "../../assets/right.svg";
import banner from "../../assets/background-wide.jpg";
import avatar from "../../assets/logo.png";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const User = () => {
  const { currentUser } = useUserStore();
  const [avatarFile, setAvatarFile] = useState<string | undefined>();
  const [bannerFile, setBannerFile] = useState<string | undefined>();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  // 从URL获取Base64
  const fetchImageAsBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // 读取完成后返回Base64字符串
      reader.readAsDataURL(blob); // 转换为Base64
    });
  };

  // 将图片转换为Base64并存储到localStorage
  const storeImagesInLocalStorage = async () => {
    if (
      currentUser &&
      currentUser.avatar !== "/uploads/default.png" &&
      currentUser.avatar
    ) {
      const avatarBase64: any = await fetchImageAsBase64(
        `${process.env.REACT_APP_API_URL||"http://localhost:5000"}${currentUser.avatar}`
      );
      localStorage.setItem("userAvatar", avatarBase64);
    }
    if (
      currentUser &&
      currentUser.banner_url !== "/uploads/default_banner.png" &&
      currentUser.banner_url
    ) {
      const bannerBase64: any = await fetchImageAsBase64(
        `${process.env.REACT_APP_API_URL||"http://localhost:5000"}${currentUser.banner_url}`
      );
      localStorage.setItem("userBanner", bannerBase64);
    }

    // 获取localStorage中的图片
    let avatarTemp = getImageFromLocalStorage("userAvatar") || avatar;
    let bannerTemp = getImageFromLocalStorage("userBanner") || banner;
    setAvatarFile(avatarTemp);
    setBannerFile(bannerTemp);
  };

  useEffect(() => {
    storeImagesInLocalStorage();
  }, [currentUser?.avatar, token,avatarFile, bannerFile]);

  // 从localStorage获取图片的函数
  const getImageFromLocalStorage = (key: string) => {
    return localStorage.getItem(key) || null; // 如果不存在返回 null
  };

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
