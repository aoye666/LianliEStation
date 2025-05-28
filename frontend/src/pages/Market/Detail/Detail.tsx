import { useMainStore } from "../../../store";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom"; // 使用 useParams 从路由获取参数
import axios from "axios";
import { message } from "antd";
import "./Detail.scss";
import copy from "../../../assets/copy-black.svg";
import stars from "../../../assets/favorites-black.svg";
import like from "../../../assets/like-black.svg";
import dislike from "../../../assets/dislike-black.svg";
import close from "../../../assets/close-black.svg";
import drop from "../../../assets/drop-black.svg";
import share from "../../../assets/share-black.svg";
import left from "../../../assets/left-black.svg";
import takePlace from "../../../assets/takePlace.png";

interface Goods {
  id: number;
  title: string;
  content: string | null;
  price: number;
  campus_id: number;
  status: "active" | "inactive" | "deleted";
  goods_type: "receive" | "sell";
  tag: string | null;
  author_id: number;
  likes: number;
  complaints: number;
  created_at: string;
  images: string[];
  author_qq_id: string | null;
  author_nickname: string | null;
  author_avatar: string | null;
  author_credit: number;
}

const Detail = () => {
  const { goods } = useMainStore();
  const param = useParams();
  const ID = param.goodsId; // 通过路由参数获取商品id
  const [currentGoods, setCurrentGoods] = useState<Goods>(); // 当前详情商品
  const [currentIndex, setCurrentIndex] = useState(0); // 当前图片索引
  const [currentAlter, setCurrentAlter] = useState("user"); // 当前互动类型 user/appeal/manage
  const touchStartX = useRef(0); // 记录触摸起始位置
  const touchEndX = useRef(0); // 记录触摸结束位置
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const numericID = Number(ID);
      if (goods)
      setCurrentGoods(goods.find((item) => item.id === numericID));
    };

    if (ID) {
      fetchData();
    }
  }, [ID]);

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
    if (currentGoods?.images.length)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentGoods?.images.length);
  };
  const prevImage = () => {
    if (currentGoods?.images.length)
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + currentGoods?.images.length) % currentGoods?.images.length
    );
  };

  // 点击复制按钮，复制发布者QQ号到剪贴板
  const handleCopy = () => {
    if (currentGoods?.author_qq_id) {
      navigator.clipboard
        .writeText(currentGoods?.author_qq_id)
        .then(() => {
          console.log("QQ号已复制到剪贴板");
          message.success('QQ号已复制到剪贴板')
        })
        .catch((err) => {
          console.error("复制过程出错: ", err);
          message.error('复制过程出错')
        });
    } else {
      console.error("未获取到当前用户QQ号");
      message.error('未获取到当前用户QQ号')
    }
  };

  // 处理点赞、举报，待设计完善
  const handleLike = async () => {
    try {
      axios.put(`${process.env.REACT_APP_API_URL||"http://localhost:5000"}/api/goods/like/${ID}`, {
        value: true,
      });
    }
    catch (error) {
      console.error("Error handling like:", error);
    }
  };
  const handleDislike = () => {
    try {
      axios.put(`${process.env.REACT_APP_API_URL||"http://localhost:5000"}/api/goods/complaint/${ID}`, {
        value: true,
      });
    }
    catch (error) {
      console.error("Error handling complaint:", error);
    }
  };

  // 处理时间格式化
  const formatDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return ""; // 如果没有时间字符串，返回空
    const datePart = dateTime.split("T")[0]; // 获取日期部分
    const timePart = dateTime.split("T")[1].split(":"); // 获取时间部分并分割为数组
    const month = datePart.split("-")[1]; // 获取月份
    const day = datePart.split("-")[2]; // 获取日期
    const hour = timePart[0]; // 获取小时
    const minute = timePart[1]; // 获取分钟
    return `${month}-${day} ${hour}:${minute}`; // 返回格式化后的字符串
  };

  //
  const handleCampusID = (campus_id: number) => {
    if (campus_id === 1) {
      return "凌水主校区";
    } else if (campus_id === 2) {
      return "开发区校区";
    } else if (campus_id === 3) {
      return "盘锦校区";
    } else {
      return "校区获取错误";
    }
  };

  return (
    <div className="detail-container">
      <div className="detail-navbar">
        <img
          className="navbar-icon"
          src={left}
          alt="返回"
          onClick={() => navigate("/market")}
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
          onClick={() => navigate("/user/favorites")}
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
            src={currentGoods?.images?.[currentIndex]
              ? `${process.env.REACT_APP_API_URL||"http://localhost:5000"}${currentGoods.images[currentIndex]}`
              : takePlace}
            alt={`${currentIndex + 1}`}
          />
          <div className="slider-index">
            {currentGoods?.images.map((_, index) => (
              <div
                key={index}
                className="index-item"
                style={{
                  backgroundColor: currentIndex === index ? "white" : "black",
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      <div className="detail-title">{currentGoods?.title}</div>
      <div className="detail-profile">
        <div className="detail-price">￥{currentGoods?.price}</div>
        <div className="detail-postType">
          {currentGoods?.goods_type === "sell" ? "出" : "收"}
        </div>
        <div className="detail-tag">{currentGoods?.tag}</div>
        <div className="detail-campus">
          {handleCampusID(currentGoods?.campus_id || 1)}
        </div>
      </div>
      <div className="detail-content">{currentGoods?.content}</div>
      <div className="detail-author">
        <img
          className="author-icon"
          src={`${process.env.REACT_APP_API_URL||"http://localhost:5000"}${currentGoods?.author_avatar}`}
          alt="发布者头像"
        />
        <div className="author-name">{currentGoods?.author_nickname}</div>
        <div className="author-credit">{currentGoods?.author_credit}分</div>
        <div className="author-time">
          {formatDateTime(currentGoods?.created_at)}
        </div>
      </div>
      <div className="detail-alternative">
        {currentAlter === "user" && (
          <div className="alter-user">
            <div className="user-like">
              <img className="like-icon" src={like} alt="喜欢" onClick={handleLike}/>
              <div className="like-text">{currentGoods?.likes}</div>
            </div>
            <div
              className="user-dislike"
              onClick={() => setCurrentAlter("appeal")}
            >
              <img className="dislike-icon" src={dislike} alt="不喜欢" onClick={handleDislike}/>
              <div className="dislike-text">{currentGoods?.complaints}</div>
            </div>
          </div>
        )}
        {currentAlter === "appeal" && (
          <div className="alter-appeal">
            <img
              className="appeal-cancel"
              src={close}
              alt="取消"
              onClick={() => setCurrentAlter("user")}
            ></img>
            <textarea
              className="appeal-area"
              placeholder="请写下您的反馈..."
            ></textarea>
            <div className="appeal-control">
              <input className="appeal-img" type="file" id="file" />
              <button className="appeal-submit">提交举报</button>
            </div>
          </div>
        )}
        {currentAlter === "manage" && (
          <div className="alter-manage">
            <div className="manage-like" onClick={handleLike}>
              <img className="like-icon" src={like} alt="喜欢" />
              <div className="like-text">{currentGoods?.likes}</div>
            </div>
            <div className="manage-dislike" onClick={handleDislike}>
              <img className="dislike-icon" src={dislike} alt="不喜欢" />
              <div className="dislike-text">{currentGoods?.complaints}</div>
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
        <div className="contact-btn" onClick={handleCopy}>
          <img
            className="qqBtn-icon"
            src={copy}
            alt="发布者QQ号"
          />
          <div className="qqBtn-text">立即联系！</div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
