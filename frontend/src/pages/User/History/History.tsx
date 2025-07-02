import Navbar from "../../../components/Navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useRecordStore } from "../../../store";
import takePlace from "../../../assets/takePlace.png";
import "./History.scss";

type checkBox = { [number: number]: boolean };

const History = () => {
  const {
    historyGoods,
    getHistoryGoods,
    removeHistoryGoods,
    initialHistoryGoods,
    page,
    clear,
    setPage,
  } = useRecordStore();
  const [checked, setChecked] = useState<checkBox>({});
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getHistoryGoods();
  }, []);

  window.addEventListener("beforeunload", () => {
    clear();
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;

      // 判断该部件是否滚动到底部
      if (scrollTop + clientHeight >= scrollHeight) {
        setPage();
        getHistoryGoods();
      }
    }
  };

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
    ids.forEach((id) => removeHistoryGoods(id));
  };

  return (
    <div className="history-container">
      <div className="header">
        <Navbar title="历史" backActive={true} backPath="/user" />
      </div>

      <div className="body">
        <div className="manange">
          <button onClick={() => handleOnClick()}>管理</button>
        </div>
        <div className="content">
          {historyGoods.map((goods) => (
            <div
              className="commodity"
              key={goods.id}
              ref={scrollRef}
              onScroll={handleScroll}
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
          ))}
          <div className="commodity">
            {isVisible ? (
              <div
                className="commodity-delete"
                key={1}
                onClick={() => handleCheck(1)}
                style={
                  checked[1]
                    ? { backgroundColor: "#3498db", border: "none" }
                    : { backgroundColor: "white" }
                }
              />
            ) : null}

            <div className="commodity-img">
              <img src={takePlace} alt="" />
            </div>
            <div className="commodity-description">
              <div className="commodity-title">c语言教材</div>
              <div className="commodity-detail">有勾画，开发区校区面交</div>
              <div className="commodity-bottom">
                <div className="commodity-price">15r</div>
                <div className="commodity-tag">教材</div>
              </div>
            </div>
          </div>

          <div className="commodity">
            <div className="commodity-img">
              <img src={takePlace} alt="" />
            </div>
            <div className="commodity-description">
              <div className="commodity-title">c语言教材</div>
              <div className="commodity-detail">有勾画，开发区校区面交</div>
              <div className="commodity-bottom">
                <div className="commodity-price">15r</div>
                <div className="commodity-tag">教材</div>
              </div>
            </div>
          </div>
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
