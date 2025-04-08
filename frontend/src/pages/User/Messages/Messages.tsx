import React, { useState } from "react"; // 确保导入 React 和 useState
import Navbar from "../../../components/Navbar/Navbar";
import "./Messages.scss";
import { useMainStore } from "../../../store";
import { useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import messages from "../../../assets/messages.png";
import complain from "../../../assets/complain.png";
import violate from "../../../assets/violate.png";
import messageRead from "../../../assets/message-read.png";
import manage from "../../../assets/settings.png";

interface OptionType {
  value: string;
  label: string;
  icon: string;
}

// 创建选项数组
const options: OptionType[] = [
  { value: "1", label: "全部", icon: messages },
  { value: "2", label: "申诉", icon: complain },
  { value: "3", label: "违规", icon: violate },
];

// 自定义选项组件
const CustomOption = (props: any) => {
  return (
    <components.Option {...props} className="messages-option">
      <img
        src={props.data.icon}
        alt={props.data.label}
        className="messages-icon"
      />
      <div className="messages-label">{props.data.label}</div>
    </components.Option>
  );
};

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

const Messages = () => {
  const navigate = useNavigate();
  const { fetchGoods, goods } = useMainStore();

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
        {/* 使用 react-select */}
        <div className="messages-control">
          <div className="messages-control-item">
            <Select
              options={options}
              components={{ Option: CustomOption }}
              className="messages-select"
              isSearchable={false} // 如果不需要搜索功能
              defaultValue={options[0]}
            />
          </div>
          <div className="messages-control-item" onClick={handleRead}>
            <div className="messages-control-item-btn">
              <img src={messageRead} alt="已读" />
              <button>已读</button>
            </div>
          </div>
          <div className="messages-control-item" onClick={handleManage}>
            <div className="messages-control-item-btn">
              <img src={manage} alt="处理" />
              <button>处理</button>
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
                    <img className="appeal-image" src="" alt="图片"></img>
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
                    <img className="response-image" src="" alt="图片"></img>
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
