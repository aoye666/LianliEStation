import { useRef, useEffect, useState, useMemo } from "react";
import { FloatButton, Carousel, Image, Skeleton } from "antd";
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
  } = useMainStore();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // 使用 useMemo 优化列数计算
  const elementsPerRow = useMemo(() => {
    const containerWidth = windowSize.width - 12; // 减去左右padding 6px + 6px
    const minItemWidth = 140; // 最小商品项宽度
    const maxItemWidth = 220; // 最大商品项宽度
    const gap = 6; // 商品项之间的间距
    
    // 根据屏幕宽度设置响应式断点
    let columns;
    if (containerWidth < 400) {
      // 小屏幕：2列
      columns = 2;
    } else if (containerWidth < 600) {
      // 中小屏幕：3列
      columns = 3;
    } else if (containerWidth < 800) {
      // 中等屏幕：4列
      columns = 4;
    } else {
      // 大屏幕：根据最小宽度动态计算
      columns = Math.floor((containerWidth + gap) / (minItemWidth + gap));
    }
    
    columns = Math.max(2, Math.min(columns, 6)); // 限制在2-6列之间
    
    // 验证计算的宽度是否合理
    const availableWidth = containerWidth - (columns - 1) * gap;
    const itemWidth = availableWidth / columns;
    
    // 如果计算出的宽度太大，增加列数
    if (itemWidth > maxItemWidth && columns < 6) {
      columns = Math.min(6, Math.floor((containerWidth + gap) / (maxItemWidth + gap)));
    }
    
    // 如果计算出的宽度太小，减少列数
    if (itemWidth < minItemWidth && columns > 2) {
      columns = Math.max(2, columns - 1);
    }
    
    return columns;
  }, [windowSize.width]);

  window.addEventListener("beforeunload", () => {
    clear();
  });

  useEffect(() => {
    fetchGoods();
    
    // 监听窗口尺寸变化
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [fetchGoods]);

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
                    filters.goods_type === "sell" ? "active-button" : "sell"
                  }
                >
                  <button
                    onClick={async () => {
                      setFilters({ goods_type: "sell" });
                      handleOnConfirm();
                    }}
                  >
                    出
                  </button>
                </div>
                <div
                  className={
                    filters.goods_type === "receive" ? "active-button" : "receive"
                  }
                >
                  <button
                    onClick={async () => {
                      setFilters({ goods_type: "receive" });
                      handleOnConfirm();
                    }}
                  >
                    收
                  </button>
                </div>
                <div
                  className={
                    filters.goods_type === null ? "active-button" : "null"
                  }
                >
                  <button
                    onClick={async () => {
                      setFilters({ goods_type: null });
                      handleOnConfirm();
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
                      filters.tag === "学习资料" ? "active-button" : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: "学习资料" });
                        handleOnConfirm();
                      }}
                    >
                      学习
                    </button>
                  </div>
                  <div
                    className={
                      filters.tag === "数码电子"
                        ? "active-button"
                        : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: "数码电子" });
                        handleOnConfirm();
                      }}
                    >
                      数码
                    </button>
                  </div>
                  <div
                    className={
                      filters.tag === null ? "active-button" : "null"
                    }
                  >
                    <button
                      onClick={async () => {
                        setFilters({ tag: null });
                        handleOnConfirm();
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
                  className={filters.campus_id === 1 ? "item-active" : "item"}
                  onClick={() => {
                    setFilters({ campus_id: 1 });
                  }}
                >
                  凌水校区
                </div>
                <div
                  className={filters.campus_id === 2 ? "item-active" : "item"}
                  onClick={() => {
                    setFilters({ campus_id: 2 });
                  }}
                >
                  开发区校区
                </div>
                <div
                  className={filters.campus_id === 3 ? "item-active" : "item"}
                  onClick={() => {
                    setFilters({ campus_id: 3 });
                  }}
                >
                  盘锦校区
                </div>
                <div
                  className={filters.campus_id === null ? "item-active" : "item"}
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
                    filters.tag === "学习资料" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "学习资料" });
                  }}
                >
                  学习资料
                </div>
                <div
                  className={
                    filters.tag === "代办跑腿" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "代办跑腿" });
                  }}
                >
                  代办跑腿
                </div>
                <div
                  className={
                    filters.tag === "生活用品" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "生活用品" });
                  }}
                >
                  生活用品
                </div>
                <div
                  className={
                    filters.tag === "数码电子" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "数码电子" });
                  }}
                >
                  数码电子
                </div>
                <div
                  className={
                    filters.tag === "账号会员" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "账号会员" });
                  }}
                >
                  账号会员
                </div>
                <div
                  className={
                    filters.tag === "咨询答疑" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "咨询答疑" });
                  }}
                >
                  咨询答疑
                </div>
                <div
                  className={
                    filters.tag === "其他" ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: "其他" });
                    console.log(filters);
                  }}
                >
                  其他
                </div>
                <div
                  className={
                    filters.tag === null ? "item-active" : "item"
                  }
                  onClick={() => {
                    setFilters({ tag: null });
                    console.log(filters);
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
                width: `calc((100vw - 12px - ${elementsPerRow - 1} * 6px) / ${elementsPerRow})`,
                minHeight: 'fit-content',
              }}
            >
              <div className="commodity-img">
                <Image
                  src={
                    item.images[0]
                      ? `${
                          process.env.REACT_APP_API_URL ||
                          "http://localhost:5000"
                        }${item.images[0]}`
                      : takePlace
                  }
                  alt="商品图片"
                  preview={false}
                  placeholder={
                    <div style={{ width: '100%', aspectRatio: '1.3' }}>
                      <Skeleton.Input active style={{ width: '100%', height: '100%' }} />
                    </div>
                  }
                />
              </div>
              <div className="commodity-title">{item.title}</div>
              <div className="commodity-bottom">
                <div className="commodity-price">{item.price}</div>
                {item.tag && item.tag !== "商品标签" && (
                  <div className="commodity-tag">{item.tag}</div>
                )}
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
