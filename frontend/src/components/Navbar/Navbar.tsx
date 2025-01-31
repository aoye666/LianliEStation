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
