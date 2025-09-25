import Navbar from "../../../components/Navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useRecordStore } from "../../../store";
import takePlace from "../../../assets/takePlace.png";
import { Card, Select, Button } from "antd"
import type { TabsProps } from "antd/lib/tabs"
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
  const [checked, setChecked] = useState<checkBox>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isPosts, setIsPosts] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const items = [
    {
      value: 'goods',
      label: '商品',
    },
    {
      value: 'posts',
      label: '帖子',
    },
  ]

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

  if(isPosts){
    await Promise.all(ids.map(id => removeHistoryPost(id)))
  } else {
    await Promise.all(ids.map(id => removeHistoryGoods(id)))
  }

  window.location.reload()
}


  return (
    <div className="history-container">
      <div className="header">
        <Navbar title="历史" backActive={true} backPath="/user" />
      </div>

      <div className="body">
        <div className="select-container">
          <Select className="select" defaultValue={"goods"} options={items} onChange={(key) => {setIsPosts(key === "posts")}} />
          <Button onClick={() => handleOnClick()} className="button">管理</Button>
        </div>
        
        <div className="content">
          {
          !isPosts&&(
          historyGoods.map((goods) => (
            <div
              className="goods"
              key={goods.id}
              ref={scrollRef}
            >
              {isVisible ? (
                <div
                  className="goods-delete"
                  key={goods.id}
                  onClick={() => handleCheck(goods.id)}
                  style={
                    checked[goods.id]
                      ? { backgroundColor: "#3498db", border: "none" }
                      : { backgroundColor: "white" }
                  }
                />
              ) : null}
              <Card className="goods-description" title={goods.title} hoverable>
                {/* <div className="goods-img">
                  <img
                    src={
                      goods.images[0]
                        ? `${process.env.REACT_APP_API_URL||"http://localhost:5000"}${goods.images[0]}`
                        : takePlace
                    }
                    alt=""
                  />
                </div> */}
                <div className="goods-detail">{goods.content}</div>
                <div className="goods-bottom">
                  <div className="goods-price">{goods.price}r</div>
                  <div className="goods-tag">{goods.tag}</div>
                </div>
              </Card>
            </div>
          )))}
          {
          isPosts&&(
          historyPosts.map((goods) => (
            <div
              className="goods"
              key={goods.id}
              ref={scrollRef}
            >
              {isVisible ? (
                <div
                  className="goods-delete"
                  key={goods.id}
                  onClick={() => handleCheck(goods.id)}
                  style={
                    checked[goods.id]
                      ? { backgroundColor: "#3498db", border: "none" }
                      : { backgroundColor: "white" }
                  }
                />
              ) : null}
              <Card className="goods-description" title={goods.title} hoverable>
                <div className="goods-detail">{goods.content}</div>
                <div className="goods-bottom">
                </div>
              </Card>
            </div>
          )))}
        </div>
      </div>

      <div className="footer">
        <div className="manage-button">
          <button onClick={() => handleOnClick()}>管理</button>
        </div>
        {isVisible ? (
          <div className="delete-button">
            <button onClick={() => handleOnDelete()}>删除</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default History;
