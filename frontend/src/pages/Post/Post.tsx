import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Post.scss"
import Navbar from '../../components/Navbar/Navbar'
import user from '../../assets/user.png'
import accept from '../../assets/accept.png'
import refresh from '../../assets/refresh.png'

const Post = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 先重置高度
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 根据内容调整高度
    }
  };

  const handleGenerate = () => {
    navigate('/template');
  }

  const handleRefresh = () => {

  }

  return (
    <div className="post-container">
      <Navbar title='发布助手小e'/>
      <div className="dialog-container">
        <div className="dialog-user">
          <div className='dialog-face'><img src={user} alt="头像"></img></div>
          <div className='dialog-content'>出c语言教材，10r。有圈画，略有磨损折页，完美主义者勿扰。</div>
        </div>
        <div className="dialog-ai">
          <div className='dialog-face'><img src={user} alt="头像"></img></div>
          <div className='dialog-content'>
            <div className='dialog-item'>`标题：${}c语言教材`</div>
            <div className="dialog-item">`价格：￥10`</div>
            <div className="dialog-item">`分类：出/学习`</div>
            <div className="dialog-item">`详情：有圈画，略有磨损折页，完美主义者勿扰。`</div>
            <div className="dialog-control">
              <div className="dialog-btn" onClick={handleGenerate}>
                <div className="btn-icon"><img src={accept} alt="生成模板"></img></div>
                <div className="btn-text">生成模板</div>
              </div>
              <div className="dialog-btn" onClick={handleRefresh}>
                <div className="btn-icon"><img src={refresh} alt="重新生成"></img></div>
                <div className="btn-text">重新生成</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="input-container">
        <textarea className="input-text" placeholder="请输入商品信息" rows={1} ref={textareaRef} onInput={handleInput}></textarea>
        <button className="input-btn">发布</button>
      </div>
    </div>
  )
}

export default Post
