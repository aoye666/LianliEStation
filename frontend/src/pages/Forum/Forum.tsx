import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  // Tabs,
  // TabsProps,
  FloatButton,
} from "antd";
import "./Forum.scss";
import { useMainStore } from "../../store";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Tabbar from "../../components/Tabbar/Tabbar";
import Like from '../../assets/like.svg';
import { PlusOutlined } from "@ant-design/icons";

const Forum = () => {
  const navigate = useNavigate();
  const { posts, getForumPosts, updateForumPosts } = useMainStore();
  const [showMore, setShowMore] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [timeFlag, setTimeFlag] = useState(false);


  // const nav: TabsProps["items"] = [
  //   {
  //     key: "1",
  //     label: "主页",
  //   },
  //   {
  //     key: "2",
  //     label: "精选",
  //   },
  // ];

  useEffect(() => {
    getForumPosts();
  }, []);

  const handleScroll = () => {
    if (bodyRef.current) {
      if (bodyRef.current.scrollTop + bodyRef.current.clientHeight >= bodyRef.current.scrollHeight - 20) {
        if (!timeFlag) {
          console.log(2)
          setTimeFlag(true)
          setTimeout(() => {
            updateForumPosts();
            setTimeFlag(false)
          }, 1000)
        }
      }
    }
  }

  return (
    <div className="forum-container">
      <div className="navbar">
        <Navbar title="校园墙" />
      </div>

      <div className="content">
        {/* <div className="banner">
          <Tabs className="Tabs" centered items={nav} defaultActiveKey="1" />
        </div> */}
        {/* 
        <div className="top-posts">
          <Row className="Row">
            <Col className="Col" span={24}>
              <Card className="Card">示例</Card>
            </Col>
          </Row>
          <Row className="Row">
            <Col className="Col" span={24}>
              <Card className="Card">示例</Card>
            </Col>
          </Row>
          <Row className="Row">
            <Col className="Col" span={24}>
              <Card className="Card">示例</Card>
            </Col>
          </Row>
        </div> */}

        {/* <div className="tag">
            <div className="tag-item">
              <div className="commodity-type">
                <div className="detail">
                  <div
                    className={
                      filters.tag === "学习资料" ? "active-button" : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: "学习资料" });
                        handleOnConfirm();
                      }}
                    >
                      学习
                    </button>
                  </div>
                  <div
                    className={
                      filters.tag === "数码电子"
                        ? "active-button"
                        : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: "数码电子" });
                        handleOnConfirm();
                      }}
                    >
                      数码
                    </button>
                  </div>
                  <div
                    className={
                      filters.tag === null ? "active-button" : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: null });
                        handleOnConfirm();
                      }}
                    >
                      全部
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="more">
              <img
                src={showMore ? close : more}
                alt="more"
                onClick={() => setShowMore(!showMore)}
              />
            </div>
          </div> */}

        <div className="posts" ref={bodyRef} onScroll={handleScroll}>
          {posts.map((post, index) => (
            <Card className="Card" title={post.title} key={index} onClick={() => navigate(`/forum-detail?id=${post.id}`)}>
              <div className="post-content">
                {post.content}
              </div>
              <div className="post-other">
                <div className="post-img">
                  {
                    post.images.map((image, index) => (
                      <img key={index} src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${image}`} alt="帖子图片" />
                    ))
                  }
                </div>

                <div className="likes">
                  <img src={Like} alt="likes" />
                  <span>{post.likes} likes</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* {showMore && (
          <div className="market-more">
            <div className="sort">
              <div className="sort-title">
                <span>类别</span>
              </div>
              <div className="sort-list">
                <div
                  className={
                    filters.tag === "学习资料" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "学习资料" });
                  }}
                >
                  学习资料
                </div>
                <div
                  className={
                    filters.tag === "代办跑腿" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "代办跑腿" });
                  }}
                >
                  代办跑腿
                </div>
                <div
                  className={
                    filters.tag === "生活用品" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "生活用品" });
                  }}
                >
                  生活用品
                </div>
                <div
                  className={
                    filters.tag === "数码电子" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "数码电子" });
                  }}
                >
                  数码电子
                </div>
                <div
                  className={
                    filters.tag === "账号会员" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "账号会员" });
                  }}
                >
                  账号会员
                </div>
                <div
                  className={
                    filters.tag === "咨询答疑" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "咨询答疑" });
                  }}
                >
                  咨询答疑
                </div>
                <div
                  className={
                    filters.tag === "其他" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "其他" });
                    console.log(filters);
                  }}
                >
                  其他
                </div>
                <div
                  className={
                    filters.tag === null ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: null });
                    console.log(filters);
                  }}
                >
                  全部
                </div>
              </div>
            </div>

            <div className="confirm">
              <button onClick={handleOnConfirm}>确认</button>
            </div>
          </div>
        )}
      </div> */}

        <div className="tabbar">
          <div className="float-button">
            <FloatButton
              style={{
                marginBottom: "20px",
                right: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
              icon={<PlusOutlined />}
              onClick={() => {
                navigate(`/publish/forum-publish`);
              }}
            />
          </div>
          <Tabbar initialIndex={1} />
        </div>
      </div>
    </div>
  );
};

export default Forum;
