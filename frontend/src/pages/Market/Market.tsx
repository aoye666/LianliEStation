import { useRef, useEffect, useState } from "react";
import { FloatButton, Carousel } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./Market.scss";
import Tabbar from "../../components/Tabbar/Tabbar";
import more from "../../assets/more.png";
import close from "../../assets/close.png";
import MarketBanner from "../../assets/banner2.png";
import ADInviting from "../../assets/ad3.3-logo.png";
import logo from "../../assets/logo.png";
import search from "../../assets/search-white.svg";
import takePlace from "../../assets/takePlace.png";
import { useMainStore } from "../../store";
import { useNavigate } from "react-router-dom";

const Market = () => {
  const [searchInputs, setSearchInputs] = useState("");
  const [showMore, setShowMore] = useState(false);
  const {
    goods,
    filters,
    setFilters,
    updateGoods,
    clearGoods,
    clear,
    fetchGoods,
    clearFilters,
  } = useMainStore();
  const [marketTypeState, setMarketTypeState] = useState<string | null>(null);
  const [commodityTypeState, setCommodityTypeState] = useState<string | null>(
    null
  );
  const [campusState, setCampusState] = useState<string | null>(null);
  const [elementsPerRow, setElementsPerRow] = useState(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  window.addEventListener("beforeunload", () => {
    clear();
  });

  useEffect(() => {
    fetchGoods();
    // 监听分布排列
    const handleResize = () => {
      const maxCount = Math.floor(window.innerWidth / 155);
      // console.log(window.innerWidth)
      // console.log(maxCount);
      // console.log(window.innerWidth / maxCount)
      setElementsPerRow(maxCount || 1);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   return () => {
  //     if (scrollRef.current) {
  //       sessionStorage.setItem('market-scroll', scrollRef.current.scrollTop.toString());
  //     }
  //   };
  // }, []);

  // // 回来后恢复位置
  // useEffect(() => {
  //   const savedScroll = sessionStorage.getItem('market-scroll');
  //   if (scrollRef.current && savedScroll) {
  //     scrollRef.current.scrollTop = parseInt(savedScroll);
  //   }
  // }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;

      // 判断该部件是否滚动到底部
      if (scrollTop + clientHeight >= scrollHeight) {
        updateGoods();
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputs(event.target.value);
  };

  const handleSearch = async () => {
    try {
      filters.searchTerm = searchInputs;
      await setFilters(filters);
      clearGoods();
      updateGoods();
    } catch (error) {
      console.log(error);
    }
    console.log(filters);
  };

  const handleOnConfirm = async () => {
    clearGoods();
    setShowMore(false);
    updateGoods();
    console.log(filters);
  };

  return (
    <div className="market-container">
      <div className="market-navbar">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <input
          type="text"
          placeholder="搜好物"
          value={searchInputs}
          onChange={handleChange}
        />
        <div className="icon" onClick={handleSearch}>
          <img src={search} alt="search" />
        </div>
      </div>

      <div className="market-body">
        <div className="un-content">
          <Carousel autoplay className="carousel" >
            <img
              className="carousel-item"
              src={MarketBanner}
              alt="schoolLogo"
              onLoad={() => window.dispatchEvent(new Event('resize'))}
            />
            <img
              className="carousel-item"
              src={ADInviting}
              alt="广告位招商"
              onLoad={() => window.dispatchEvent(new Event('resize'))}
            />
          </Carousel>
          <div className="region"></div>

          <div className="tag">
            <div className="tag-item">
              <div className="market-type">
                <div
                  className={
                    marketTypeState === "sell" ? "active-button" : "sell"
                  }
                >
                  <button
                    onClick={async () => {
                      setFilters({ goods_type: "sell" });
                      handleOnConfirm();
                      setMarketTypeState("sell");
                    }}
                  >
                    出
                  </button>
                </div>
                <div
                  className={
                    marketTypeState === "receive" ? "active-button" : "receive"
                  }
                >
                  <button
                    onClick={async () => {
                      setFilters({ goods_type: "receive" });
                      handleOnConfirm();
                      setMarketTypeState("receive");
                    }}
                  >
                    收
                  </button>
                </div>
                <div
                  className={
                    marketTypeState === null ? "active-button" : "null"
                  }
                >
                  <button
                    onClick={async () => {
                      setFilters({ goods_type: null });
                      handleOnConfirm();
                      setMarketTypeState(null);
                    }}
                  >
                    全部
                  </button>
                </div>
              </div>
              <div className="commodity-type">
                <div className="detail">
                  <div
                    className={
                      commodityTypeState === "学习资料" ? "active-button" : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: "学习资料" });
                        handleOnConfirm();
                        setCommodityTypeState("学习资料");
                      }}
                    >
                      学习资料
                    </button>
                  </div>
                  <div
                    className={
                      commodityTypeState === "数码电子"
                        ? "active-button"
                        : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: "数码电子" });
                        handleOnConfirm();
                        setCommodityTypeState("数码电子");
                      }}
                    >
                      数码
                    </button>
                  </div>
                  <div
                    className={
                      commodityTypeState === null ? "active-button" : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: null });
                        handleOnConfirm();
                        setCommodityTypeState(null);
                      }}
                    >
                      全部
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="more">
              <img
                src={showMore ? close : more}
                alt="more"
                onClick={() => setShowMore(!showMore)}
              />
            </div>
          </div>
        </div>

        {showMore && (
          <div className="market-more">
            <div className="price">
              <div className="price-title">
                <span>价格区间</span>
              </div>
              <div className="price-unit">
                <div className="price-low">
                  <input
                    type="text"
                    placeholder="最低价格"
                    onChange={(e) => {
                      setFilters({
                        priceRange: [
                          parseInt(e.target.value),
                          filters.priceRange[1],
                        ],
                      });
                    }}
                  />
                </div>
                -
                <div className="price-high">
                  <input
                    type="text"
                    placeholder="最高价格"
                    onChange={(e) => {
                      setFilters({
                        priceRange: [
                          filters.priceRange[0],
                          parseInt(e.target.value),
                        ],
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="location">
              <div className="location-title">
                <span>校区</span>
              </div>
              <div className="location-list">
                <div
                  className="item"
                  onClick={() => {
                    setFilters({ campus_id: 1 });
                  }}
                >
                  凌水校区
                </div>
                <div
                  className="item"
                  onClick={() => {
                    setFilters({ campus_id: 2 });
                  }}
                >
                  开发区校区
                </div>
                <div
                  className="item"
                  onClick={() => {
                    setFilters({ campus_id: 3 });
                  }}
                >
                  盘锦校区
                </div>
                <div
                  className="item"
                  onClick={() => {
                    setFilters({ campus_id: null });
                  }}
                >
                  全部
                </div>
              </div>
            </div>

            <div className="sort">
              <div className="sort-title">
                <span>类别</span>
              </div>
              <div className="sort-list">
                <div
                  className={
                    commodityTypeState === "学习资料" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "学习资料" });
                    setCommodityTypeState("学习资料");
                  }}
                >
                  学习资料
                </div>
                <div
                  className={
                    commodityTypeState === "代办跑腿" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "代办跑腿" });
                    setCommodityTypeState("代办跑腿");
                  }}
                >
                  代办跑腿
                </div>
                <div
                  className={
                    commodityTypeState === "生活用品" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "生活用品" });
                    setCommodityTypeState("生活用品");
                  }}
                >
                  生活用品
                </div>
                <div
                  className={
                    commodityTypeState === "数码电子" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "数码电子" });
                    setCommodityTypeState("数码电子");
                  }}
                >
                  数码电子
                </div>
                <div
                  className={
                    commodityTypeState === "账号会员" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "账号会员" });
                    setCommodityTypeState("账号会员");
                  }}
                >
                  账号会员
                </div>
                <div
                  className={
                    commodityTypeState === "咨询答疑" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "咨询答疑" });
                    setCommodityTypeState("咨询答疑");
                  }}
                >
                  咨询答疑
                </div>
                <div
                  className={
                    commodityTypeState === "其他" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "其他" });
                    setCommodityTypeState("其他");
                  }}
                >
                  其他
                </div>
                <div
                  className={
                    commodityTypeState === null ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: null });
                    setCommodityTypeState(null);
                  }}
                >
                  全部
                </div>
              </div>
            </div>

            <div className="confirm">
              <button onClick={handleOnConfirm}>确认</button>
            </div>
          </div>
        )}

        <div
          className="content"
          ref={scrollRef}
          onScroll={handleScroll}
          style={
            { "--elements-per-row": elementsPerRow } as React.CSSProperties
          }
        >
          {goods.map((item) => (
            <div
              className="commodity-item"
              key={item.id}
              onClick={() => {
                navigate(`/market/${item.id}`);
              }}
              style={{
                width:
                  "calc((100vw - 4px) / var(--elements-per-row) - var(--elements-per-row)*1px - (var(--elements-per-row) - 1)*2px)",
              }}
            >
              <div className="commodity-img">
                <img
                  src={
                    item.images[0]
                      ? `${
                          process.env.REACT_APP_API_URL ||
                          "http://localhost:5000"
                        }${item.images[0]}`
                      : takePlace
                  }
                  alt="takePlace"
                />
              </div>
              <div className="commodity-title">{item.title}</div>
              <div className="commodity-bottom">
                <div className="commodity-price">{item.price}</div>
                <div className="commodity-tag">{item.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="market-tabbar">
        <div className="float-button">
          <FloatButton
            style={{
              marginBottom: "20px",
              right: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
            icon={<PlusOutlined />}
            onClick={() => {
              navigate("/publish/market-publish-choice");
            }}
          />
        </div>
        <Tabbar initialIndex={0} />
      </div>
    </div>
  );
};

export default Market;
