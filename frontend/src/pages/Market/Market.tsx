import { useRef, useEffect, useState } from 'react'
import "./Market.scss"
import MoreBar from '../../components/moreBar/moreBar'
import Tabbar from '../../components/Tabbar/Tabbar'
import more from '../../assets/more.png'
import close from '../../assets/close.png'
import topLogo from '../../assets/topLogo.png'
import axios from 'axios'
import logo from '../../assets/logo.png'
import search from '../../assets/search.png'
import { usePostStore } from '../../store'

const Market = () => {
  const [searchInputs, setSearchInputs]=useState('')
  const [showMore, setShowMore] = useState(false);
  const page = usePostStore((state) => state.page);
  const posts = usePostStore((state) => state.posts);
  const setPage = usePostStore((state) => state.setPage);
  const filters = usePostStore((state) => state.filters);
  const setFilters = usePostStore((state) => state.setFilters);
  const updatePosts = usePostStore((state) => state.updatePosts);
  const clearPosts = usePostStore((state) => state.clearPosts);

  const scrollRef = useRef<HTMLDivElement|null>(null);
  

  // useEffect(() => {
  //   fetchPosts();
  // },[])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;

      // 判断该部件是否滚动到底部
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setPage();
        updatePosts();
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputs(event.target.value);
  }

  const handleSearch = async () => {
    try {
      filters.searchTerm = searchInputs;
      await setFilters(filters); 
      clearPosts(); 
      updatePosts();
    } catch (error) {
      console.log(error);
    }
  }

  const handleOnConfirm = async () => {
    clearPosts();
    setShowMore(false);
    updatePosts();
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
                    <button onClick={() => setFilters({post_type:'sell'})}>出</button>
                  </div>
                  <div className='buy'>
                    <button onClick={() => setFilters({post_type:'receive'})}>收</button>
                  </div>
                </div>
                <div className='commodity-type'>
                  <div className='detail'>
                    <div>
                      <button onClick={() => setFilters({tag: '跑腿打卡'})}>跑腿</button>
                    </div>
                    <div>
                      <button onClick={() => setFilters({tag: '数码电子'})}>数码</button>
                    </div>
                    <div>
                      <button onClick={() => setFilters({tag: '服饰配饰'})}>服饰</button>
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
                    <div className="moreBar">
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

                      <div className='sort'>
                          <div className='sort-title'>
                              <span>类别</span>
                          </div>
                          <div className='sort-list'>
                              <div className='item' onClick={() => {setFilters({tag: '资料作业'})}}>资料作业</div>
                              <div className='item' onClick={() => {setFilters({tag: '跑腿打卡'})}}>跑腿打卡</div>
                              <div className='item' onClick={() => {setFilters({tag: '数码电子'})}}>数码电子</div>
                              <div className='item' onClick={() => {setFilters({tag: '拼单组队'})}}>拼单组队</div>
                              <div className='item' onClick={() => {setFilters({tag: '服饰配饰'})}}>服饰配饰</div>
                              <div className='item' onClick={() => {setFilters({tag: '其他'})}}>其他</div>
                          </div>
                      </div>
                      
                      <div className='confirm'>
                          <button onClick={handleOnConfirm}>确认</button>
                      </div>
                    </div>
                  </div>
          }

        <div className='content' ref={scrollRef}>    
        {
          posts.map((post) => (
            <div className='commodity'>
            <div className='commodity-img'>
              <img src={post.images[0]} alt="" />
            </div>
            <div className='commodity-title'>
              {post.title}
            </div>
            <div className='commodity-bottom'>
              <div className='commodity-price'>
                {post.price}
              </div>
              <div className='commodity-tag'>
                {post.tag}
              </div>
            </div>      
          </div>
            ))
          }
          <div className='commodity'>
          <div className='commodity-img'>
            <img src="commodity.jpg" alt="" />
          </div>
          <div className='commodity-title'>
            c语言教材
          </div>
          <div className='commodity-bottom'>
            <div className='commodity-price'>
              ￥5
            </div>
            <div className='commodity-tag'>
              学习
            </div>
          </div>      
          </div>
          
        </div>
      </div>

      <div className='market-tabbar'>   
        <Tabbar />
      </div>

    </div>
    

  )
}

export default Market
