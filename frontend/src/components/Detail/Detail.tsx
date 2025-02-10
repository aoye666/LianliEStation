import { usePostStore } from '../../store'



import user from '../../assets/user.png'
import copy from '../../assets/copy.png'

// 点击复制按钮，复制发布者QQ号到剪贴板
const handleCopy = () => {
  
}

const Detail = () => {
  return (
    <div className='detail-container'>
      <div className="detail-imgSlider">

      </div>
      <div className="detail-title"></div>
      <div className="detail-price"></div>
      <div className="detail-postType"></div>
      <div className="detail-tag"></div>
      <div className="detail-content"></div>
      <div className="detail-poster">
        <img className='poster-icon' src={user} alt="发布者头像" />
        <div className="poster-name">proselyte</div>
        <div className="poster-credit">100</div>
        <div className="poster-time"></div>
        <img className='poster-copyBtn' src={copy} alt="发布者QQ号" onClick={handleCopy}/>
      </div>
    </div>
  )
}

export default Detail
