import { useNavigate } from "react-router-dom";
import "./Settings.scss";
import { useAuthStore } from "../../store";
import Navbar from "../../components/Navbar/Navbar";
import logoutIcon from "../../assets/logout.png"
import right from "../../assets/right.png"
import about from "../../assets/about.png"

const Settings = () => {
  const navigate = useNavigate();
  // 调用 useAuthStore 来获取 logout 方法
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  return (
    <div className="settings-container">
      <Navbar title="设置" />
       <div className="settings-item" onClick={() => navigate('/')}>{/*<>后续写about页</> */}
          <img src={about} alt="关于连理e站" className="item-icon"></img><div className="item-text">关于连理e站</div><img src={right} alt="右箭头" className="right-icon"></img>
        </div>
      <div className="logout-container" onClick={handleLogout}>
        <div className="logout-icon">
          <img src={logoutIcon} alt="退出"></img>
        </div>
        <div className="logout-text">退出</div>
      </div>
    </div>
  );
};

export default Settings;
