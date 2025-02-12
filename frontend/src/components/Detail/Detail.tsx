import { usePostStore, useUserStore } from "../../store";
import { useState, useEffect, useRef } from "react";
import "./Detail.scss";

import user from "../../assets/user.png";
import copy from "../../assets/copy.png";
import img1 from "../../assets/background1.jpg";
import img2 from "../../assets/background2.jpg";
import img3 from "../../assets/background3.jpg";

const Detail = () => {
  const images = [img1, img2, img3];
  const currentUser = useUserStore((state) => state.currentUser);
  const [qq, setQq] = useState(currentUser?.qq); // 初始化 qq
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0); // 触摸起始位置
  const touchEndX = useRef(0); // 触摸结束位置

  // 更新 qq 当 currentUser 变化时
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
                backgroundColor: currentIndex == 0 ? "white" : "black",
              }}
            ></div>
            <div
              className="index-item"
              style={{
                backgroundColor: currentIndex == 1 ? "white" : "black",
              }}
            ></div>
            <div
              className="index-item"
              style={{
                backgroundColor: currentIndex == 2 ? "white" : "black",
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="detail-title">占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。</div>
      <div className="detail-profile">
        <div className="detail-price">￥5</div>
        <div className="detail-postType">出</div>
        <div className="detail-tag">学业资料</div>
      </div>
      <div className="detail-content">
        占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。占位符内容，请替换为实际内容。
      </div>
      <div className="detail-poster">
        <img className="poster-icon" src={user} alt="发布者头像" />
        <div className="poster-name">PROSELYTE</div>
        <div className="poster-credit">100分</div>
        <div className="poster-time">05-05-10:00</div>
        <img
          className="poster-copyBtn"
          src={copy}
          alt="发布者QQ号"
          onClick={handleCopy}
        />
      </div>
    </div>
  );
};

export default Detail;
