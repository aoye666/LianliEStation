// 使用说明： 1、在文件头中import Navbar from 'path/to/Navbar'（具体路径）;
//           2、在需要的地方直接使用<Navbar title='标题' backActive={true or false} backPath='/market'/>第一个参数必填、第二三个参数为回退按钮参数可选。
// 注意：1、下方主容器设置 height: calc(100vh - 50px); margin-top: 50px; 以保证不重叠。不需要在navbar外部再嵌套。
//      2、图片文件路径请使用正确的相对路径。
//      3、可选的回退按钮参数 backActive 和 backPath，默认值为 false 和 "market"，需补充完整路径。

import "./Navbar.scss";
import left from '../../assets/left-white.svg';
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  title: string;
  backActive?: boolean;
  backPath?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title, backActive = false, backPath = "/market"}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`${backPath}`);
  };

  return (
    <div className='navbar-container'>
      {backActive && (
        <div className='left' onClick={handleBack}>
          <img src={left} alt='返回' />
        </div>
      )}
      <div className="navbar-title">{title}</div>
    </div>
  );
};

export default Navbar;
