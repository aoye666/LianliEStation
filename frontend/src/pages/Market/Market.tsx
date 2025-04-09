import { useRef, useEffect, useState } from 'react'
import "./Market.scss"
import Tabbar from '../../components/Tabbar/Tabbar'
import more from '../../assets/more.png'
import close from '../../assets/close.png'
import topLogo from '../../assets/topLogo.png'
import logo from '../../assets/logo.png'
import search from '../../assets/search.png'
import takePlace from '../../assets/takePlace.png'
import { useMainStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

const Market = () => {
  const [searchInputs, setSearchInputs]=useState('')
  const [showMore, setShowMore] = useState(false);
  const { marketPage, goods, setMarketPage, filters, setFilters, updateGoods, clearGoods, clear, fetchGoods, clearFilters } = useMainStore();
  const scrollRef = useRef<HTMLDivElement|null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchGoods();
  },[])

  window.addEventListener('beforeunload', () => {
    clear();
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;

      // 判断该部件是否滚动到底部
      if (scrollTop + clientHeight >= scrollHeight) {
        setMarketPage();
        updateGoods();
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputs(event.target.value);
  }

  const handleSearch = async () => {
    try {
      console.log(filters)
      filters.searchTerm = searchInputs;
      await setFilters(filters); 
      clearGoods(); 
      updateGoods();
    } catch (error) {
      console.log(error);
    }
    console.log(filters)
  }

  const handleOnConfirm = async () => {
    clearGoods();
    setShowMore(false);
    updateGoods();
  }

  return (
    <div className='market-container'>

      <div className='market-navbar'>   

      <div className='logo'><img src={logo} alt='logo' /></div>
        <input type="text" placeholder="搜好物" value={searchInputs} onChange={handleChange} />
      <div className="icon" onClick={handleSearch}><img src={search} alt='search' /></div>

      </div>
    

      <div className='market-body'>
        <div className='un-content'>   

          <div className='img'>
            <img src={topLogo} alt="schoolLogo" />
          </div>

          <div className='region'>
            
          </div>
          
          <div className='tag'>
              <div className='tag-item'>
                <div className='market-type'>
                  <div className='sell'>
                    <button onClick={async() => {
                      setFilters({goods_type:'sell'})
                      handleOnConfirm();
                      }}>出</button>
                  </div>
                  <div className='buy'>
                    <button onClick={async() => {
                      setFilters({goods_type:'receive'})
                      handleOnConfirm();
                      }}>收</button>
                  </div>
                </div>
                <div className='commodity-type'>
                  <div className='detail'>
                    <div>
                      <button onClick={async() => {
                        setFilters({tag: '跑腿代课'})
                        handleOnConfirm();
                        }}>跑腿</button>
                    </div>
                    <div>
                      <button onClick={async() => {
                        setFilters({tag: '数码电子'})
                        handleOnConfirm();
                      }}>数码</button>
                    </div>
                    <div>
                      <button onClick={async() => {
                        setFilters({tag: null})
                        handleOnConfirm();
                      }}>全部</button>
                    </div>
                  </div>  
                </div>
              </div>
              <div className='more'>
                  <img src={showMore? close : more} alt="more" onClick={() => setShowMore(!showMore)}/>
                  
                </div>
            </div>

        </div>
        
        {showMore && 
                  <div className='market-more'>
                    <div className="morebar">
                      <div className='price'>
                          <div className='price-title'>
                              <span>价格区间</span>
                          </div>
                          <div className='price-unit'>
                              <div className='price-low'>
                                  <input type="text" placeholder='最低价格' onChange={(e) => {setFilters({priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}}/>
                              </div>
                              -
                              <div className='price-high'>
                                  <input type="text" placeholder='最高价格' onChange={(e) => {setFilters({priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}}/>
                              </div>
                          </div>

                      </div>

                      <div className='location'>
                          <div className='location-title'>
                              <span>校区</span>
                          </div>
                          <div className='location-list'>
                              <div className='item' onClick={() => {setFilters({campus_id: 1})}}>凌水校区</div>
                              <div className='item' onClick={() => {setFilters({campus_id: 2})}}>开发区校区</div>
                              <div className='item' onClick={() => {setFilters({campus_id: 3})}}>盘锦校区</div>
                              <div className='item' onClick={() => {setFilters({campus_id: null})}}>全部</div>
                          </div>
                      </div>

                      <div className='sort'>
                          <div className='sort-title'>
                              <span>类别</span>
                          </div>
                          <div className='sort-list'>
                              <div className='item' onClick={() => {setFilters({tag: '学业资料'})}}>学业资料</div>
                              <div className='item' onClick={() => {setFilters({tag: '跑腿代课'})}}>跑腿代课</div>
                              <div className='item' onClick={() => {setFilters({tag: '生活用品'})}}>生活用品</div>
                              <div className='item' onClick={() => {setFilters({tag: '数码电子'})}}>数码电子</div>
                              <div className='item' onClick={() => {setFilters({tag: '拼单组队'})}}>拼单组队</div>
                              <div className='item' onClick={() => {setFilters({tag: '捞人询问'})}}>捞人询问</div>
                              <div className='item' onClick={() => {setFilters({tag: "其他"})}}>其他</div>
                              <div className='item' onClick={() => {setFilters({tag: null})}}>全部</div>
                          </div>
                      </div>
                      
                      <div className='confirm'>
                          <button onClick={handleOnConfirm}>确认</button>
                      </div>
                    </div>
                  </div>
          }

        <div className='content' ref={scrollRef} onScroll={handleScroll}>    
        {
          goods.map((item) => (
            <div className='commodity-item' key={item.id} onClick={() => {navigate(`/market/${item.id}`)}}>
              <div className='commodity-img'>
                <img src={item.images[0]?`http://localhost:5000${item.images[0]}`:takePlace} alt="takePlace" />
              </div>
              <div className='commodity-title'>
                {item.title}
              </div>
              <div className='commodity-bottom'>
                <div className='commodity-price'>
                  {item.price}
                </div>
                <div className='commodity-tag'>
                  {item.tag}
              </div>
              </div>      
            </div>
            ))
        }          
        </div>
      </div>

      <div className='market-tabbar'>   
        <Tabbar />
      </div>

    </div>
    

  )
}

export default Market
