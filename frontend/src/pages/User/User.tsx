import Tabbar from "../../components/Tabbar/Tabbar"
import "./User.scss"
import user from "../../assets/user.png"
import { useUserStore } from "../../store"
import { useNavigate } from "react-router-dom"
import stars from "../../assets/stars.png"
import history from "../../assets/history.png"
import messages from "../../assets/messages.png"
import settings from "../../assets/settings.png"
import right from "../../assets/right.png"

const User = () => {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();

  return (
    <div className="user-container">
      <div className="user-info">
        <div className="user-face"><img src={user} alt="用户头像" /></div>
        <div className="user-name">昵称：{currentUser?.username || 'test'}</div>
        <div className="user-credit">信誉：{currentUser?.credit || '100'}</div>
        <div className="user-email">邮箱：{currentUser?.email || 'test@test.com'}</div>
      </div>
      <div className="user-settings">
        <div className="user-item" onClick={() => navigate('/stars')}>
          <img src={stars} alt="收藏" className="item-icon"></img><div className="item-text">收藏</div><img src={right} alt="右箭头" className="right-icon"></img>
        </div> 
        <div className="user-item" onClick={() => navigate('/history')}>
          <img src={history} alt="历史" className="item-icon"></img><div className="item-text">历史</div><img src={right} alt="右箭头" className="right-icon"></img>
        </div>
        <div className="user-item" onClick={() => navigate('/messages')}>
          <img src={messages} alt="信箱" className="item-icon"></img><div className="item-text">信箱 </div><img src={right} alt="右箭头" className="right-icon"></img>
        </div>
      </div>
      <div className="user-settings" onClick={() => navigate('/settings')}>
        <div className="user-item">
          <img src={settings} alt="设置" className="item-icon"></img><div className="item-text">设置</div><img src={right} alt="右箭头" className="right-icon"></img>
        </div>
      </div>
      <Tabbar />
    </div>
  )
}

export default User
