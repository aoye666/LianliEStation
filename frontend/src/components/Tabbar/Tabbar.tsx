import { useNavigate } from "react-router-dom";
import "./Tabbar.scss";
import market from "../../assets/market.png";
import forum from "../../assets/forum.png";
import publish from "../../assets/publish.png";
import user from "../../assets/user.png";

const Tabbar = () => {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="tabbar-container">
      <div className="tabbar-item" onClick={() => handleClick("/market")}>
        <div className="tabbar-icon">
          <img src={market} alt="market"></img>
        </div>
        <span>商城</span>
      </div>
      <div className="tabbar-item" onClick={() => handleClick("/forum")}>
        <div className="tabbar-icon">
          <img src={forum} alt="forum"></img>
        </div>
        <span>校园墙</span>
      </div>
      <div className="tabbar-item" onClick={() => handleClick("/publish")}>
        <div className="tabbar-icon">
          <img src={publish} alt="publish"></img>
        </div>
        <span>发布</span>
      </div>
      <div className="tabbar-item" onClick={() => handleClick("/user")}>
        <div className="tabbar-icon">
          <img src={user} alt="user"></img>
        </div>
        <span>用户</span>
      </div>
    </div>
  );
};

export default Tabbar;
