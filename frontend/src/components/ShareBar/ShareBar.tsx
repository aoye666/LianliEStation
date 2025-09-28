import React from'react';
import "./ShareBar.scss";
import Link from '../../assets/link.svg';
import { message } from 'antd';

const Share:React.FC = () => {
    return (
        <div className='share_bar'>
            <div className='link_copy'>
                <img 
                className='link_icon'
                src={Link}
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    message.success('链接已复制到剪贴板');
                }} />
                <div className="text">
                    复制链接
                </div>
            </div>
        </div>
    );
}

export default Share;