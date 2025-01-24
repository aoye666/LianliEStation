import "./Navbar.scss";
import logo from '../../assets/logo.png';
import search from '../../assets/search.png';
import React, { useState } from 'react';
import axios from "axios";

type SearchInputs = {
  text: string;
}

const Navbar = () => {

  const [text, setText] = useState<SearchInputs["text"]>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  }

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://api.example.com/search?text=${text}`);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='navbar-container'>
      <div className='icon'><img src={logo} alt='logo' /></div>
      <input type="text" placeholder="搜好物" value={text} onChange={handleChange} />
      <div className="icon" onClick={handleSearch}><img src={search} alt='search' /></div>
    </div>
  )
}

export default Navbar;
