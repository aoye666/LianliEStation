import { usePostStore, useUserStore } from "../../store";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Detail.scss";
import user from "../../assets/user.png";
import copy from "../../assets/copy.png";
import stars from "../../assets/stars.png";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import close from "../../assets/close.png";
import drop from "../../assets/drop.png";
import share from "../../assets/share.png";
import left from "../../assets/left.png";
import img1 from "../../assets/background1.jpg";
import img2 from "../../assets/background2.jpg";
import img3 from "../../assets/background3.jpg";

const Detail = () => {
  const images = [img1, img2, img3];
  const currentUser = useUserStore(state => state.currentUser);
  // console.log(currentUser);
  const [qq, setQq] = useState(currentUser?.qq); // 初始化 qq
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAlter, setCurrentAlter] = useState("user");
  const touchStartX = useRef(0); // 触摸起始位置
  const touchEndX = useRef(0); // 触摸结束位置

  const navigate = useNavigate();

  // 当 currentUser 变化时更新 qq 
  useEffect(() => {
    setQq(currentUser?.qq);
  }, [currentUser]);

  // 处理滑动事件
  const handleTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX; // 记录触摸起始位置
  };

  const handleTouchMove = (e: any) => {
    touchEndX.current = e.touches[0].clientX; // 记录触摸结束位置
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current; // 计算滑动距离
    if (distance > 50) {
      nextImage(); // 向左滑动，切换到下一张
    } else if (distance < -50) {
      prevImage(); // 向右滑动，切换到上一张
    }
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // 点击复制按钮，复制发布者QQ号到剪贴板
  const handleCopy = () => {
    if (qq) {
      navigator.clipboard
        .writeText(qq)
        .then(() => {
          console.log("QQ号已复制到剪贴板");
        })
        .catch((err) => {
          console.error("复制过程出错: ", err);
        });
    } else {
      console.error("未获取到当前用户QQ号");
    }
  };

  return (
    <div className="detail-container">
      <div className="detail-navbar">
        <img
          className="navbar-icon"
          src={left}
          alt="返回"
          onClick={() => navigate("/user/market")}
        />
        <img
          className="navbar-icon"
          src={share}
          alt="分享"
          onClick={() => console.log("分享功能正在开发，暂不支持")}
        />
        <img
          className="navbar-icon"
          src={stars}
          alt="收藏"
          onClick={() => navigate("/user/stars")}
        />
      </div>
      <div
        className="detail-slider"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="slider-container">
          <img
            className="slider-item"
            src={images[currentIndex]}
            alt={`${currentIndex + 1}`}
          />
          <div className="slider-index">
            <div
              className="index-item"
              style={{
                backgroundColor: currentIndex === 0 ? "white" : "black",
              }}
            ></div>
            <div
              className="index-item"
              style={{
                backgroundColor: currentIndex === 1 ? "white" : "black",
              }}
            ></div>
            <div
              className="index-item"
              style={{
                backgroundColor: currentIndex === 2 ? "white" : "black",
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="detail-title">
        占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。
      </div>
      <div className="detail-profile">
        <div className="detail-price">￥5</div>
        <div className="detail-postType">出</div>
        <div className="detail-tag">学业资料</div>
      </div>
      <div className="detail-content">
        占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。
      </div>
      <div className="detail-poster">
        <img className="poster-icon" src={user} alt="发布者头像" />
        <div className="poster-name">PROSELYTE</div>
        <div className="poster-credit">100分</div>
        <div className="poster-time">05-05-10:00</div>
      </div>
      <div className="detail-alternative">
        {currentAlter === "user" && (
          <div className="alter-user">
            <div className="user-like">
              <img className="like-icon" src={like} alt="喜欢" />
              <div className="like-text">12</div>
            </div>
            <div className="user-dislike" onClick={() => setCurrentAlter("appeal")}>
              <img className="dislike-icon" src={dislike} alt="不喜欢" />
              <div className="dislike-text">11</div>
            </div>
          </div>
        )}
        {currentAlter === "appeal" && (
          <div className="alter-appeal">
            <img className="appeal-cancel" src={close} alt="取消" onClick={() => setCurrentAlter("user")}></img>
            <textarea className="appeal-area">
            </textarea>
            <div className="appeal-control">
              <input className="appeal-img" type="file" id="file" />
              <button className="appeal-submit">提交举报</button>
            </div>
          </div>
        )}
        {currentAlter === "manage" && (
          <div className="alter-manage">
            <div className="manage-like">
              <img className="like-icon" src={like} alt="喜欢" />
              <div className="like-text">12</div>
            </div>
            <div className="manage-dislike">
              <img className="dislike-icon" src={dislike} alt="不喜欢" />
              <div className="dislike-text">11</div>
            </div>
            <img className="manage-drop" src={drop} alt="删除" />
          </div>
        )}
      </div>
      <div className="detail-btn">
        <div className="star-btn">
          <img className="starBtn-icon" src={stars} alt="收藏" />
          <div className="starBtn-text">加入收藏</div>
        </div>
        <div className="contact-btn">
          <img
            className="qqBtn-icon"
            src={copy}
            alt="发布者QQ号"
            onClick={handleCopy}
          />
          <div className="qqBtn-text">立即联系！</div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
