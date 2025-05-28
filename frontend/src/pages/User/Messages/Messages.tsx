import React, { useState } from "react"; // 确保导入 React 和 useState
import { Image } from "antd";
import Navbar from "../../../components/Navbar/Navbar";
import "./Messages.scss";
import { useMainStore } from "../../../store";
import { useNavigate } from "react-router-dom";
import {
  ProductOutlined,
  DislikeOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import messages_active from "../../../assets/messages-blue.svg";
import messages_inactive from "../../../assets/messages-black.svg";
import manage from "../../../assets/settings.svg";
import takePlace from "../../../assets/takePlace.png";

// 消息类型定义
interface Message {
  id: number; // 消息id，用作key值
  response_type: string; // 'appeal' 或 'violation'
  content: string;
  appealStatus?: string; // 申诉状态，'pending' 或 'completed'
  read_status?: string; // 回复状态，'unread' 或 'read'
  created_at: string; // 格式为 '2022-01-01 12:00:00'
  image: string; // 图片
  related_id: number; // 关联的订单或商品 ID
}

interface Conditions {
  type: string;
  read: string;
  manage: boolean;
}

// 信息类型菜单选择
const items: MenuProps["items"] = [
  {
    key: "1",
    label: <>全部</>,
    icon: <ProductOutlined />,
  },
  {
    key: "2",
    label: <>申诉</>,
    icon: <SafetyOutlined />,
  },
  {
    key: "3",
    label: <>违规</>,
    icon: <DislikeOutlined />,
  },
];

const Messages = () => {
  const navigate = useNavigate();
  const { fetchGoods, goods } = useMainStore();
  // 三个筛选条件
  const [conditions, setConditions] = useState<Conditions>({
    type: "all", // 'appeal' 或 'violation' 或 'all'
    read: "all", // 'unread' 或 'read' 或 'all'
    manage: false, // true/false
  });
  // 消息列表
  const [messagesList, setMessagesList] = useState<Message[]>([
    {
      id: 1,
      response_type: "appeal",
      content: "发布信息含有不文明用语",
      read_status: "unread",
      created_at: "10月20日",
      image: "",
      related_id: 1,
    },
    {
      id: 2,
      response_type: "violation",
      content: "发布信息含有不文明用语",
      read_status: "unread",
      created_at: "8月30日",
      image: "",
      related_id: 2,
    },
    {
      id: 3,
      response_type: "response",
      content: "您的申诉经核实已处理，感谢您的支持！",
      read_status: "unread",
      created_at: "5月9日",
      image: "",
      related_id: 3,
    },
    // 这里添加更多的消息对象...
  ]);

  const handleRead = () => {
    // 处理已读逻辑
  };

  const handleManage = () => {
    // 处理管理逻辑
  };

  return (
    <div>
      <Navbar title="信箱" backActive={true} backPath="/user" />
      <div className="messages-container">
        <div className="messages-control">
          <div className="messages-control-item">
            <Dropdown menu={{ items }}>
              <a onClick={(e) => e.preventDefault()}>
                <ProductOutlined
                  style={{ width: "20px", height: "20px", marginRight: "5px" }}
                />
                全部
              </a>
            </Dropdown>
          </div>
          <div className="messages-control-item" onClick={handleRead}>
            <div className="messages-control-item-btn">
              <img
                src={`${
                  conditions.read === "all"
                    ? messages_inactive
                    : messages_active
                }`}
                alt="已读"
              />
              <button>已读</button>
            </div>
          </div>
          <div className="messages-control-item" onClick={handleManage}>
            <div className="messages-control-item-btn">
              <img src={manage} alt="管理" />
              <button>管理</button>
            </div>
          </div>
        </div>
        <div className="messages-list">
          {messagesList.map((message) => (
            <div key={message.id} className="messages-list-item">
              {message.response_type === "appeal" ? (
                <div className="message-appeal">
                  <div className="appeal-row">
                    <div className="appeal-type">申诉</div>
                    <div className="appeal-status">{message.appealStatus}</div>
                    <div className="appeal-title">《{message.related_id}》</div>
                    <div className="appeal-time">{message.created_at}</div>
                  </div>
                  <div className="appeal-row">
                    <div className="appeal-content">{message.content}</div>
                    <Image
                      className="appeal-image"
                      src={takePlace}
                      alt="图片"
                    ></Image>
                  </div>
                </div>
              ) : (
                <div className="message-response">
                  <div className="response-row">
                    {message.response_type === "violation" ? (
                      <div className="response-type-violation">违规</div>
                    ) : (
                      <div className="response-type-response">回复</div>
                    )}
                    <div className="response-title">
                      《{message.related_id}》
                    </div>
                    <div className="response-time">{message.created_at}</div>
                  </div>
                  <div className="response-row">
                    <div className="response-content">{message.content}</div>
                    <Image
                      className="response-image"
                      src={takePlace}
                      alt="图片"
                    ></Image>
                    {/* <div className="response-read">{message.read_status}</div> */}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
