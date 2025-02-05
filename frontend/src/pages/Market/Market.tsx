import { useEffect, useState } from 'react'
import "./Market.scss"
import MoreBar from '../../components/moreBar/moreBar'
import Tabbar from '../../components/Tabbar/Tabbar'
import more from '../../assets/more.png'
import close from '../../assets/close.png'
import topLogo from '../../assets/topLogo.png'
import axios from 'axios'
import logo from '../../assets/logo.png'
import search from '../../assets/search.png'

const Market = () => {
  type SearchInputs = {
    text: string;
  }
  let [marketType, setMarketType] = useState('sell');
  let [commodityType, setCommodityType] = useState('');
  let [showMore, setShowMore] = useState(false);

  const [text, setText] = useState<SearchInputs["text"]>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  }

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/search?title=${text}`);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className='market-container'>

      <div className='market-navbar'>   

      <div className='logo'><img src={logo} alt='logo' /></div>
        <input type="text" placeholder="搜好物" value={text} onChange={handleChange} />
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
                    <button onClick={() => setMarketType('sell')}>出</button>
                  </div>
                  <div className='buy'>
                    <button onClick={() => setMarketType('buy')}>收</button>
                  </div>
                </div>
                <div className='commodity-type'>
                  <div className='detail'>
                    <div>
                      <button onClick={() => setCommodityType('跑腿')}>跑腿</button>
                    </div>
                    <div>
                      <button onClick={() => setCommodityType('数码')}>数码</button>
                    </div>
                    <div>
                      <button onClick={() => setCommodityType('服饰')}>服饰</button>
                    </div>
                  </div>  
                </div>
              </div>
              <div className='more'>
                <img src="" alt="" />
                  <img src={showMore? close : more} alt="more" onClick={() => setShowMore(!showMore)}/>
                  {showMore && 
                  <div>
                    <MoreBar />
                  </div>
                  }
                </div>
            </div>

          <div className='price'>
            <div className='price-input'>

            </div>
          </div>



        </div>

        <div className='content'>    
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
          </div><div className='commodity'>
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
          </div><div className='commodity'>
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
