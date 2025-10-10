import { useNavigate } from "react-router-dom";
import "./Settings.scss";
import { useUserStore } from "../../../store";
import Navbar from "../../../components/Navbar/Navbar";
import logoutIcon from "../../../assets/logout-black.svg"
import right from "../../../assets/right-black.svg"
import about from "../../../assets/about-black.svg"

const Settings = () => {
  const navigate = useNavigate();
  // 调用 useUserStore 来获取 logout 方法和认证状态
  const logout = useUserStore((state) => state.logout);
  const currentUser = useUserStore((state) => state.currentUser);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  }

  return (
    <div className="settings-container">
      <Navbar title="设置" backActive={true} backPath="/user" />
      <div className="settings-item" >
        <div className="item-text">用户名</div>
        <div className="item-value">{currentUser?.username}</div>
      </div>
      <div className="settings-item" >
        <div className="item-text">邮箱</div>
        <div className="item-value">{currentUser?.email}</div>
      </div>
      <div className="settings-item spacing-top" onClick={() => navigate('/user/settings/reset/nickname')}>
        <div className="item-text">昵称</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item" onClick={() => navigate('/user/settings/reset/campus_id')}>
        <div className="item-text">默认校区</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item" onClick={() => navigate('/user/settings/reset/qq_id')}>
        <div className="item-text">绑定QQ</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item spacing-top" onClick={() => navigate('/user/settings/reset/password')}>
        <div className="item-text">密码</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item spacing-top" onClick={() => navigate('/user/settings/reset/avatar')}>
        <div className="item-text">头像</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item" onClick={() => navigate('/user/settings/reset/background')}>
        <div className="item-text">发布页背景</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item" onClick={() => navigate('/user/settings/reset/banner')}>
        <div className="item-text">资料卡背景</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item" onClick={() => navigate('/user/settings/reset/theme_id')}>
        <div className="item-text">主题风格</div><img src={right} alt="详情" className="right-icon"></img>
      </div>
      <div className="settings-item spacing-top" onClick={() => navigate('/user/settings/about')}>
        <div className="item-text">关于连理e站</div><img src={about} alt="详情" className="right-icon"></img>
      </div>
      {isAuthenticated && <div className="settings-item spacing-top" onClick={handleLogout}><div className="item-text">退出当前账号</div><img src={logoutIcon} alt="退出" className="right-icon"></img></div>}
    </div>
  );
};

export default Settings;
