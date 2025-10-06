import Navbar from "../../../components/Navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useRecordStore, useUserStore } from "../../../store";
import takePlace from "../../../assets/takePlace.png";
import { Card, Dropdown, Empty } from "antd";
import { AppstoreOutlined, ShoppingOutlined, FileTextOutlined, SettingOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import NoticeLogin from "../../../components/NoticeLogin/NoticeLogin";
import "./History.scss";

type checkBox = { [number: number]: boolean };

const History = () => {
  const {
    historyGoods,
    getHistory,
    removeHistoryGoods,
    historyPosts,
    removeHistoryPost,
    clear,
  } = useRecordStore();
  const { isAuthenticated } = useUserStore();
  const [checked, setChecked] = useState<checkBox>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isPosts, setIsPosts] = useState(false);
  const [currentType, setCurrentType] = useState("商品");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            setIsPosts(false);
            setCurrentType("商品");
          }}
        >
          商品
        </div>
      ),
      icon: <ShoppingOutlined />,
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => {
            setIsPosts(true);
            setCurrentType("帖子");
          }}
        >
          帖子
        </div>
      ),
      icon: <FileTextOutlined />,
    },
  ];

  useEffect(() => {
    getHistory();
  }, [isVisible]);

  window.addEventListener("beforeunload", () => {
    clear();
  });

  const handleOnClick = () => {
    setIsVisible(!isVisible);
  };

  const handleCheck = (id: number) => {
    setChecked({ ...checked, [id]: !checked[id] });
  };
  
  const handleOnDelete = async () => {
    const ids = Object.keys(checked)
      .filter(id => checked[parseInt(id)])
      .map(id => parseInt(id))

    if (isPosts) {
      await Promise.all(ids.map(id => removeHistoryPost(id)))
    } else {
      await Promise.all(ids.map(id => removeHistoryGoods(id)))
    }

    window.location.reload()
  }


  return (
    <div className="history-container">
      {!isAuthenticated && <NoticeLogin />}
      <div className="header">
        <Navbar title="历史" backActive={true} backPath="/user" />
      </div>

      <div className="body">
        <div className="select-container">
          <div className="select-item">
            <Dropdown menu={{ items }}>
              <div onClick={(e) => e.preventDefault()} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AppstoreOutlined
                  style={{ width: "20px", height: "20px", marginRight: "5px" }}
                />
                {currentType}
              </div>
            </Dropdown>
          </div>
          <div className="select-item" onClick={() => handleOnClick()}>
            <div className="select-item-btn">
              <SettingOutlined style={{ marginRight: "5px" }} />
              管理
            </div>
          </div>
        </div>

        <div className="content">
          {!isPosts ? (
            historyGoods.length === 0 ? (
              <div className="history-empty">
                <Empty
                  description="还没有浏览过商品"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              historyGoods.map((goods) => (
                <div
                  className="item"
                  key={goods.id}
                  ref={scrollRef}
                >
                  {isVisible ? (
                    <div
                      className={`item-delete ${checked[goods.id] ? 'checked' : ''}`}
                      key={goods.id}
                      onClick={() => handleCheck(goods.id)}
                    />
                  ) : null}
                  <Card className="item-description" title={goods.title} hoverable>
                    <div className="item-content">
                      <div className="item-img">
                        <img
                          src={
                            goods.images[0]
                              ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${goods.images[0]}`
                              : takePlace
                          }
                          alt=""
                        />
                      </div>
                      <div className="item-info">
                        <div className="item-detail">{goods.content}</div>
                        <div className="item-bottom">
                          <div className="goods-price">{goods.price}r</div>
                          <div className="item-tag">{goods.tag}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )
          ) : (
            historyPosts.length === 0 ? (
              <div className="history-empty">
                <Empty
                  description="还没有浏览过帖子"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              historyPosts.map((post) => (
                <div
                  className="item"
                  key={post.id}
                  ref={scrollRef}
                >
                  {isVisible ? (
                    <div
                      className={`item-delete ${checked[post.id] ? 'checked' : ''}`}
                      key={post.id}
                      onClick={() => handleCheck(post.id)}
                    />
                  ) : null}
                  <Card className="item-description" title={post.title} hoverable>
                    <div className="item-content">
                      <div className="item-img">
                        <img
                          src={
                            post.images[0]
                              ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${post.images[0]}`
                              : takePlace
                          }
                          alt=""
                        />
                      </div>
                      <div className="item-info">
                        <div className="item-detail">{post.content}</div>
                        <div className="item-bottom">
                          <div className="item-tag">{post.tag}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {
        isVisible ? (
        <div className="footer">
          <div className="footer-buttons">
            <button className="btn-complete">
              交易完成
            </button>
            <button className="btn-edit">
              修改商品
            </button>
            <button className="btn-delete" onClick={() => handleOnDelete()}>
              删除商品
            </button>
          </div>
        </div>) : null
      }

    </div>
  );
};

export default History;
