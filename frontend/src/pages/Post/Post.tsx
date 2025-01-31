import "./Post.scss"
import Navbar from '../../components/Navbar/Navbar'
import user from '../../assets/user.png'

const Post = () => {
  return (
    <div className="post-container">
      <Navbar title='发布助手小e'/>
      <div className="dialog-container">
        <div className="dialog-user">
          <div className='dialog-face'><img src={user} alt="头像"></img></div>
          <div className='dialog-content'>这是内容这是内容这是内容这是内容这是内容这是内容</div>
        </div>
        <div className="dialog-ai">
          <div className='dialog-face'><img src={user} alt="头像"></img></div>
          <div className='dialog-content'>这是内容这是内容这是内容这是内容这是内容这是内容</div>
        </div>
      </div>
      <div className="input-container">
        <textarea className="input-text" placeholder="请输入商品信息"></textarea>
        <button className="input-btn">发布</button>
      </div>
    </div>
  )
}

export default Post
