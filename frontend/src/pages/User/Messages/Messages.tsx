import { useEffect, useState } from "react";
import { Image } from "antd";
import Navbar from "../../../components/Navbar/Navbar";
import "./Messages.scss";
import { useMainStore, useRecordStore } from "../../../store";
import {
  ProductOutlined,
  MessageOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { timeConvert } from "../../../utils/timeConvert";
import messages_read from "../../../assets/messages-read.svg";
import messages_unread from "../../../assets/messages-unread.svg";
import takePlace from "../../../assets/takePlace.png";

// 信息类型定义(包含 appeal 与 response 的全部属性)
// interface Message {
//   id: number; // 消息id，用作key值
//   user_id?: number; // 用户id
//   response_type?: string; // 'appeal' 或 'violation'
//   related_id?: number; // 关联的订单或商品 ID
//   author_id?: number; // 申诉者id
//   post_id?: number; // 被申诉的帖子id
//   content: string;
//   type?: string; // 申诉类型，'goods' 或 'post'
//   status?: string; // 申诉状态，'pending' 或 'approved' 或 'denied'
//   read_status: string; // 已读状态，'unread' 或 'read'
//   created_at: string; // 格式为 '2022-01-01 12:00:00'
// }

interface Conditions {
  type: string;
  read: boolean;
  manage: boolean;
}

const Messages = () => {
  // 三个筛选条件
  const [conditions, setConditions] = useState<Conditions>({
    type: "all", // 'appeal' 或 'response' 或 'all'
    read: false, // true/false
    manage: false, // true/false
  });

  const { appeals, responses, fetchResponses, searchAppeals, markResponse } =
    useRecordStore();

  // 消息列表
  const [messagesList, setMessagesList] = useState<any[]>([]);

  // 信息类型菜单选择
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            setConditions({ ...conditions, type: "all" });
          }}
        >
          全部
        </div>
      ),
      icon: <ProductOutlined />,
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => {
            setConditions({ ...conditions, type: "appeal" });
          }}
        >
          申诉
        </div>
      ),
      icon: <SafetyOutlined />,
    },
    {
      key: "3",
      label: (
        <div
          onClick={() => {
            setConditions({ ...conditions, type: "response" });
          }}
        >
          回复
        </div>
      ),
      icon: <MessageOutlined />,
    },
  ];

  const handleList = async (type: string, read: boolean) => {
    let combinedMessages: any[] = [];
    // 刷新消息列表
    if (type === "all") {
      fetchResponses();
      searchAppeals();
      // 更新为messageList
      combinedMessages = [...appeals, ...responses];
    } else if (type === "appeal") {
      searchAppeals();
      // 更新为messageList
      combinedMessages = [...appeals];
    } else {
      fetchResponses();
      // 更新为messageList
      combinedMessages = [...responses];
    }

    if (read) {
      // 筛选为已读消息
      combinedMessages = combinedMessages.filter(
        (msg) => msg.read_status === "read"
      );
    } else {
      // 筛选为未读消息
      combinedMessages = combinedMessages.filter(
        (msg) => msg.read_status === "unread"
      );
    }

    // 按照 created_at 进行排序
    combinedMessages.sort(
      (b, a) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // 生成唯一的 key 值，顺序对应排序后的消息顺序
    const sortedMessagesWithKeys = combinedMessages.map((msg, index) => ({
      ...msg,
      key: `${index}`, // 生成唯一的 key
    }));

    setMessagesList(sortedMessagesWithKeys);
    console.log(messagesList);
  };

  useEffect(() => {
    handleList(conditions.type, conditions.read);
    // console.log(conditions);
    // console.log(messagesList);
  }, [conditions]);

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
          <div
            className="messages-control-item"
            onClick={() => {
              setConditions({ ...conditions, read: !conditions.read });
            }}
          >
            <div className="messages-control-item-btn">
              <img
                src={`${
                  conditions.read === false ? messages_unread : messages_read
                }`}
                alt="未读/已读"
              />
              <button>{conditions.read === false ? "未读" : "已读"}</button>
            </div>
          </div>
        </div>

        <div className="messages-list">
          {messagesList.map((message) => (
            <div key={message.key} className="messages-list-item">
              {!message.response_type ? (
                <div className="message-appeal">
                  <div className="appeal-row">
                    <div className="appeal-type">申诉</div>
                    <div className="appeal-status">
                      {message.status === "pending"
                        ? "处理中"
                        : message.status === "resolved"
                        ? "已解决"
                        : "已拒绝"}
                    </div>
                    <div className="appeal-title">《{message.related_id}》</div>
                    {conditions.read === false ? (
                      <button
                        className="response-read-control"
                        onClick={async (e) => {
                          e.preventDefault(); // 如果需要阻止默认行为
                          await markResponse(message.id, "appeal", "read");
                          // await handleList(conditions.type, conditions.read);
                          console.log(messagesList);
                        }}
                      >
                        设为已读
                      </button>
                    ) : (
                      <button
                        className="response-unread-control"
                        onClick={async (e) => {
                          e.preventDefault(); // 如果需要阻止默认行为
                          await markResponse(message.id, "appeal", "unread");
                        }}
                      >
                        设为未读
                      </button>
                    )}
                    <div className="appeal-time">
                      {timeConvert(message.created_at)}
                    </div>
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
                      <div className="response-type-response">处理</div>
                    )}
                    <div className="response-title">
                      《{message.related_id}》
                    </div>
                    {conditions.read === false ? (
                      <button
                        className="response-read-control"
                        onClick={async (e) => {
                          e.preventDefault(); // 如果需要阻止默认行为
                          await markResponse(message.id, "response", "read");
                        }}
                      >
                        设为已读
                      </button>
                    ) : (
                      <button
                        className="response-unread-control"
                        onClick={async (e) => {
                          e.preventDefault(); // 如果需要阻止默认行为
                          await markResponse(message.id, "response", "unread");
                        }}
                      >
                        设为未读
                      </button>
                    )}

                    <div className="response-time">
                      {timeConvert(message.created_at)}
                    </div>
                  </div>
                  <div className="response-row">
                    <div className="response-content">{message.content}</div>
                    <Image
                      className="response-image"
                      src={takePlace}
                      alt="图片"
                    ></Image>
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
