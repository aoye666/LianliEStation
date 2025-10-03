import React, { useEffect, useState,useRef } from "react";
import {
  Card,
  Tabs,
  TabsProps,
  FloatButton,
} from "antd";
import "./Forum.scss";
import { useRecordStore } from "../../store";
import { useMainStore } from "../../store";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Tabbar from "../../components/Tabbar/Tabbar";
import Like from '../../assets/like.svg';
import { PlusOutlined } from "@ant-design/icons";

const { Meta } = Card;

const Forum = () => {
  const navigate = useNavigate();
  const mainStore = useMainStore();
  const { posts } = mainStore;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [timeFlag, setTimeFlag] = useState(false);


  const nav: TabsProps["items"] = [
    {
      key: "1",
      label: "主页",
    },
    {
      key: "2",
      label: "精选",
    },
  ];

  useEffect(() => {
    mainStore.getForumPosts();
    console.log(posts)
  }, []);

  const handleScroll = () => {
    if (bodyRef.current) {
      if(bodyRef.current.scrollTop + bodyRef.current.clientHeight >= bodyRef.current.scrollHeight -20){
        if(!timeFlag){
          console.log(2)
          setTimeFlag(true)
          setTimeout(() => {
            mainStore.updateforumPosts();
            setTimeFlag(false)
          },1000)
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
        <div className="banner">
          <Tabs className="Tabs" centered items={nav} defaultActiveKey="1" />
        </div>
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
                            <img key={index} src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${image}`}/>
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
      </div>

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
  );
};

export default Forum;
