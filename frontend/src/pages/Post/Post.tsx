import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Post.scss";
import Navbar from "../../components/Navbar/Navbar";
import user from "../../assets/user.png";
import accept from "../../assets/accept.png";
import refresh from "../../assets/refresh.png";
import { generateTemplate } from "../../api/postApi";

interface PostProps {
  title: string;
  price: number;
  tag: string;
  post_type: string;
  details: string;
}

const Post = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [textareaValue, setTextareaValue] = useState<string>("");
  const [dialogHistory, setDialogHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // 设置对话框自适应高度
  const handleHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // 先重置高度
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 根据内容调整高度
    }
  };

  // 用户点击对话框发布按钮
  const handlePost = async () => {
    if (!textareaValue) {
      alert("请输入商品信息");
      return;
    }

    // 添加用户对话框
    setDialogHistory((prevHistory) => [
      ...prevHistory,
      { role: "user", content: textareaValue },
    ]);

    // 调用API生成模板
    const result = await generateTemplate(textareaValue);
    if (result) {
      // 添加AI对话框
      setDialogHistory((prevHistory) => [
        ...prevHistory,
        { role: "ai", content: JSON.stringify(result) },
      ]);
    } else {
      alert("生成失败，请重试");
    }

    // 清空文本框
    setTextareaValue("");
  };

  // 用户点击生成模板按钮
  const handleGenerateTemplate = (content: string) => {
    try {
      const templateData: PostProps = JSON.parse(content);
      // 跳转至模板页，并传递模板参数
      navigate("/template", { state: templateData });
    } catch (error) {
      console.error("解析模板数据失败", error);
      alert("解析模板数据失败，请重试");
    }
  };

  return (
    <div className="post-container">
      <Navbar title="发布助手小e" />
      <div className="dialog-container">
        {dialogHistory.map((dialog, index) => (
          <div
            key={index}
            className={dialog.role === "user" ? "dialog-user" : "dialog-ai"}
          >
            <div className="dialog-face">
              <img src={user} alt="头像"></img>
            </div>
            <div className="dialog-content">
              {dialog.role === "user" ? (
                dialog.content
              ) : (
                <>
                  <div className="dialog-item">
                    `标题：${JSON.parse(dialog.content).title}`
                  </div>
                  <div className="dialog-item">
                    `价格：￥${JSON.parse(dialog.content).price}`
                  </div>
                  <div className="dialog-item">
                    `分类：${JSON.parse(dialog.content).post_type.label}`
                  </div>
                  <div className="dialog-item">
                    `详情：${JSON.parse(dialog.content).details}`
                  </div>
                  <div className="dialog-control">
                    <div
                      className="dialog-btn"
                      onClick={() => handleGenerateTemplate(dialog.content)}
                    >
                      <div className="btn-icon">
                        <img src={accept} alt="生成模板"></img>
                      </div>
                      <div className="btn-text">生成模板</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="input-container">
        <textarea
          className="input-text"
          placeholder="请输入商品信息"
          rows={1}
          ref={textareaRef}
          onInput={handleHeight}
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
        ></textarea>
        <button className="input-btn" onClick={handlePost}>
          发布
        </button>
      </div>
    </div>
  );
};

export default Post;
