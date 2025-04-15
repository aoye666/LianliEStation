import axios from "axios";
import { useRef, useState, useEffect } from "react"; // 导入useEffect
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store";
import Cookies from "js-cookie";
import "./Publish.scss";
import Navbar from "../../components/Navbar/Navbar";
import Tabbar from "../../components/Tabbar/Tabbar";
import user from "../../assets/user.png";
import logo from "../../assets/logo.png";
import accept from "../../assets/accept.png";
import refresh from "../../assets/refresh.png";

export interface PublishProps {
  title: string;
  price: number;
  tag: string;
  post_type: string;
  details: string;
}

const Publish: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [textareaValue, setTextareaValue] = useState<string>("");
  const [dialogHistory, setDialogHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [previousText, setPreviousText] = useState<string>("");
  const [backgroundFile, setBackgroundFile] = useState<string | undefined>();

  const token = Cookies.get("auth-token");
  const { currentUser } =  useUserStore();

  // 将图片转换为Base64并存储到localStorage  
    const storeImagesInLocalStorage = async () => {  
      if (currentUser&&currentUser.background_url&&currentUser.background_url!== "/uploads/default_background.png") {  
        const backgroundBase64: any = await fetchImageAsBase64(`http://localhost:5000${currentUser.background_url}`);  
        localStorage.setItem("userBackground", backgroundBase64);  
      } 

      // 获取localStorage中的图片  
      let backgroundTemp = getImageFromLocalStorage("userBackground") || undefined;
      setBackgroundFile(backgroundTemp);
    };  
    
    // 从URL获取Base64  
    const fetchImageAsBase64 = async (url: string) => {  
      const response = await fetch(url);  
      const blob = await response.blob();  
      return new Promise((resolve) => {  
        const reader = new FileReader();  
        reader.onloadend = () => resolve(reader.result); // 读取完成后返回Base64字符串  
        reader.readAsDataURL(blob); // 转换为Base64  
      });  
    };  
  
    useEffect(() => {  
      // 存储请求到的图片  
      if (!localStorage.getItem("userBackground"))
      storeImagesInLocalStorage();  
    }, [token, currentUser?.background_url,backgroundFile]);  
  
    // 从localStorage获取图片的函数  
    const getImageFromLocalStorage = (key: string) => {  
      return localStorage.getItem(key) || null; // 如果不存在返回 null  
    };  

  // 设置对话框自适应高度
  const handleHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // 先重置高度
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 根据内容调整高度
    }
  };

  // API调用
  const handleRequest = async (text: string = textareaValue) => {
    if (!text) {
      alert("请输入商品信息");
      return;
    }
    // 添加用户对话框
    setDialogHistory((prevHistory) => [
      ...prevHistory,
      { role: "user", content: text },
    ]);
    // 调用API生成模板
    try {
      const res = await axios.post(
        "http://localhost:5000/api/publish/template",
        { text: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res) {
        // 添加AI对话框
        setDialogHistory((prevHistory) => [
          ...prevHistory,
          { role: "ai", content: JSON.stringify(res.data) },
        ]);
      } else {
        alert("生成失败，请重试");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.error("缺少必要参数");
      } else if (error.response && error.response.status === 401) {
        console.error("未授权，请检查你的登录状态");
        alert("未授权，请检查你的登录状态");
      } else if (error.response && error.response.status === 500) {
        console.error("服务器错误");
      } else {
        console.error("Error generating AI product info:", error);
      }
      alert("生成失败，请重试");
    }
    // 清空文本框,重置高度
    if (textareaValue) {
      setPreviousText(textareaValue);
      setTextareaValue("");
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // 用户点击发布按钮
  const handlePost = () => {
    handleRequest();
  };

  // 用户点击生成模板按钮
  const handleGenerateTemplate = (content: string) => {
    try {
      const templateData: PublishProps = JSON.parse(content);
      // 跳转至模板页，并传递模板参数
      navigate("/publish/template", { state: templateData });
    } catch (error) {
      console.error("解析模板数据失败", error);
      alert("解析模板数据失败，请重试");
    }
  };

  // 用户点击刷新按钮
  const handleRefresh = () => {
    // 移除上一条AI对话记录
    const lastAIDialogIndex = dialogHistory.findIndex(
      (dialog) => dialog.role === "ai"
    );
    let newDialogHistory = dialogHistory.filter(
      (_, index) => index !== lastAIDialogIndex
    );

    // 移除上一条用户对话记录
    const lastUserDialogIndex = newDialogHistory.findIndex(
      (dialog) => dialog.role === "user"
    );
    newDialogHistory = newDialogHistory.filter(
      (_, index) => index !== lastUserDialogIndex
    );

    setDialogHistory(newDialogHistory);

    // 重新生成AI对话
    handleRequest(previousText);
  };

  // 监听dialogHistory的变化并滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [dialogHistory]);

  return (
    <div className="publish-container">
      <Navbar title="发布助手小e" />
      <div className="dialog-container" ref={containerRef}>
        {backgroundFile ? (
          <img
            src={backgroundFile}
            alt="背景"
            className="dialog-bg"
          ></img>
        ) : null}
        {
          <div
          className="dialog-ai"
        >
          <div className="dialog-face">
            <img src={ logo } alt="头像"></img>
          </div>
          <div className="dialog-content">
            嗨，Duter！我是发布助手小e，很高兴为您服务！请在下面的对话框中发布您的商品信息。
          </div>
        </div>
        }
        {dialogHistory.map((dialog, index) => (
          <div
            key={index}
            className={dialog.role === "user" ? "dialog-user" : "dialog-ai"}
          >
            <div className="dialog-face">
              <img src={dialog.role === "user" ? user : logo} alt="头像"></img>
            </div>
            <div className="dialog-content">
              {dialog.role === "user" ? (
                dialog.content
              ) : (
                <>
                  <div className="dialog-item">
                    标题：{JSON.parse(dialog.content).title}
                  </div>
                  <div className="dialog-item">
                    类型：
                    {JSON.parse(dialog.content).post_type === "sell"
                      ? "出"
                      : "收"}
                  </div>
                  <div className="dialog-item">
                    分类：{JSON.parse(dialog.content).tag}
                  </div>
                  <div className="dialog-item">
                    价格：￥{JSON.parse(dialog.content).price}
                  </div>
                  <div className="dialog-item">
                    详情：{JSON.parse(dialog.content).details}
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
                    <div className="dialog-btn" onClick={() => handleRefresh()}>
                      <div className="btn-icon">
                        <img src={refresh} alt="重新生成"></img>
                      </div>
                      <div className="btn-text">重新生成</div>
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
      <Tabbar initialIndex={2} />
    </div>
  );
};

export default Publish;
