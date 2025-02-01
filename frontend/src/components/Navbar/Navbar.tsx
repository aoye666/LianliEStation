// 使用说明： 在文件头中import Navbar from 'path/to/Navbar'（具体路径）;
// 在需要的地方使用<Navbar title='标题'/>
// 下方主容器设置 height: calc(100vh - 50px); margin-top: 50px; 以保证不重叠。

import "./Navbar.scss";
import left from '../../assets/left.png';
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/user");
  };

  return (
    <div className='navbar-container'>
      <div className='left' onClick={handleBack}>
        <img src={left} alt='返回' />
      </div>
      <div className="navbar-title">{title}</div>
    </div>
  );
};

export default Navbar;
