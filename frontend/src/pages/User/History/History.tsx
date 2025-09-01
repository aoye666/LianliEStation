import Navbar from "../../../components/Navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useRecordStore } from "../../../store";
import takePlace from "../../../assets/takePlace.png";
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
  const handleOnDelete = () => {
    const ids = Object.keys(checked)
      .filter((id) => checked[parseInt(id)])
      .map((id) => parseInt(id));
    if(!isPosts)
      ids.forEach((id) => removeHistoryGoods(id));
    else
      ids.forEach((id) => removeHistoryPost(id));

  };

  return (
    <div className="history-container">
      <div className="header">
        <Navbar title="历史" backActive={true} backPath="/user" />
      </div>

      <div className="body">
        <div className="button-group">
          <button onClick={() => handleOnClick()}>管理</button>
          <button onClick={() => setIsPosts(!isPosts)}>{isPosts? "发布帖子" : "发布商品"}</button>
        </div>
        <div className="content">
          {
          !isPosts&&(
          historyGoods.map((goods) => (
            <div
              className="commodity"
              key={goods.id}
              ref={scrollRef}
            >
              {isVisible ? (
                <div
                  className="commodity-delete"
                  key={goods.id}
                  onClick={() => handleCheck(goods.id)}
                  style={
                    checked[goods.id]
                      ? { backgroundColor: "#3498db", border: "none" }
                      : { backgroundColor: "white" }
                  }
                />
              ) : null}

              <div className="commodity-img">
                <img
                  src={
                    goods.images[0]
                      ? `${process.env.REACT_APP_API_URL||"http://localhost:5000"}${goods.images[0]}`
                      : takePlace
                  }
                  alt=""
                />
              </div>
              <div className="commodity-description">
                <div className="commodity-title">{goods.title}</div>
                <div className="commodity-detail">{goods.content}</div>
                <div className="commodity-bottom">
                  <div className="commodity-price">{goods.price}r</div>
                  <div className="commodity-tag">{goods.tag}</div>
                </div>
              </div>
            </div>
          )))}
          {
          isPosts&&(
          historyPosts.map((goods) => (
            <div
              className="commodity"
              key={goods.id}
              ref={scrollRef}
            >
              {isVisible ? (
                <div
                  className="commodity-delete"
                  key={goods.id}
                  onClick={() => handleCheck(goods.id)}
                  style={
                    checked[goods.id]
                      ? { backgroundColor: "#3498db", border: "none" }
                      : { backgroundColor: "white" }
                  }
                />
              ) : null}
              <div className="commodity-description">
                <div className="commodity-title">{goods.title}</div>
                <div className="commodity-detail">{goods.content}</div>
                <div className="commodity-bottom">
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      <div className="footer">
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
