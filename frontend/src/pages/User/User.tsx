import Tabbar from "../../components/Tabbar/Tabbar"
import "./User.scss"
import user from "../../assets/user.png"
import { useUserStore } from "../../store"
import { useNavigate } from "react-router-dom"

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
          收藏
        </div> 
        <div className="user-item" onClick={() => navigate('/history')}>
          历史
          </div>
        <div className="user-item" onClick={() => navigate('/messages')}>
          信箱
        </div>
      </div>
      <div className="user-settings" onClick={() => navigate('/settings')}>
        <div className="user-item">
          设置
        </div>
      </div>
      <Tabbar />
    </div>
  )
}

export default User
