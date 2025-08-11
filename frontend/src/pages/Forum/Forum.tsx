import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Card,
  Image,
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
import takePlace from "../../assets/takePlace.png";
import publish from "../../assets/publish-white.svg";
import { PlusOutlined } from "@ant-design/icons";

const { Meta } = Card;

const Forum = () => {
  const navigate = useNavigate();
  const mainStore = useMainStore();
  const { forums } = mainStore;
  const nav: TabsProps["items"] = [
    {
      key: "1",
      label: "时间",
    },
    {
      key: "2",
      label: "热度",
    },
    {
      key: "3",
      label: "精选",
    },
  ];

  useEffect(() => {
    mainStore.getForumPosts();
  }, []);

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

        <div className="posts">
          {forums.map((post, index) => (
            <Row
              key={index}
              className="Row"
              onClick={() => navigate(`/forum-detail?id=${post.id}`)}
            >
              <Col className="Col" span={24}>
                <Card className="Card" title={post.title}>
                  {post.content}
                  <Row gutter={[8, 8]}>
                    {
                      post.images.map((image, index) => (
                        <Col key={index} span={8}>
                          <img src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${image[index]}`}/>
                        </Col>
                      ))
                    }
                  </Row>

                </Card>
              </Col>
            </Row>
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
