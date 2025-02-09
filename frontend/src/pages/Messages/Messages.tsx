import Navbar from '../../components/Navbar/Navbar';  
import "./Messages.scss";  
import { useNavigate } from "react-router-dom";  
import Select, { components } from 'react-select'; // 导入 Select 组件  
import search from '../../assets/search.png';  
import messages from '../../assets/messages.png';  
import complain from '../../assets/complain.png';  
import violate from '../../assets/violate.png';  

interface OptionType {  
  value: string;  
  label: string;
  icon: string;  
}  

// 创建选项数组  
const options: OptionType[] = [  
  { value: '1', label: '全部', icon: messages },  
  { value: '2', label: '申诉', icon: complain },  
  { value: '3', label: '违规', icon: violate },  
];  

// 自定义选项组件  
const CustomOption = (props: any) => {  
  return (  
    <components.Option {...props} className='messages-option'>  
      <img  
        src={props.data.icon}  
        alt={props.data.label}  
        className="messages-icon"  
      />  
      <div className="messages-label">{props.data.label}</div>
    </components.Option>  
  );  
};  

const Messages = () => {  
  const navigate = useNavigate();  

  const handleSearch = () => {  
    
  };  
<div><br></br></div>
  return (  
    <div>  
      <Navbar title="信箱" />  
      <div className="messages-container">  
        <div className="messages-search-container">  
          <input  
            type='text'  
            placeholder='搜索消息'  
            className="messages-search-input"  
          />  
          <div className="messages-search-btn" onClick={handleSearch}>  
            <img src={search} alt="搜索" />  
          </div>  
        </div>  
        {/* 使用 react-select */}  
        <div className="messages-control">  
          <div className="messages-control-item">  
            <Select  
              options={options}  
              components={{ Option: CustomOption }}
              className="messages-select"
              isSearchable={false} // 如果不需要搜索功能
              defaultValue={ options[0] } 
              styles={{indicatorsContainer: (provided) => ({...provided, width: "60px"}),
              control: (provided) => ({...provided, width: "360px"})}}
            />  
          </div>  
          <div className="messages-control-item">2</div>  
          <div className="messages-control-item">3</div>  
        </div>  
        <div className="messages-list">  
          <div className="messages-list-item"></div>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default Messages;